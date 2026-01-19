import { notFound } from "next/navigation";
import { getPageBySlug as getPage } from "@/modules/pages/actions/page.actions";
import { Button } from "@/components/ui/button";
import type { PageSlide, PageElement } from "@/modules/pages/schemas/page.schema";
import { Countdown } from "./components/Countdown";
import { RsvpForm } from "./components/RsvpForm";
import { Gallery } from "./components/Gallery";

// Create a component for fonts to avoid next/head issues in app dir
const Fonts = ({ customFonts }: { customFonts?: { name: string, url: string }[] }) => (
    <>
        <style dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Inter:wght@100..900&family=Lato:wght@100..900&family=Merriweather:wght@300;400;700&family=Montserrat:wght@100..900&family=Open+Sans:wght@300..800&family=Playfair+Display:wght@400..900&family=Roboto:wght@100..900&display=swap');
        `}} />
        {customFonts && customFonts.length > 0 && (
            <style dangerouslySetInnerHTML={{
                __html: customFonts.map(f => `
                @font-face {
                    font-family: '${f.name}';
                    src: url('${f.url}');
                }
            `).join('\n')
            }} />
        )}
    </>
);


export default async function DynamicPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const { preview } = await searchParams;
    const page = await getPage(slug);

    if (!page) {
        notFound();
    }

    if (!page.isPublished && !preview) {
        notFound();
    }

    const slides = page.content as PageSlide[] || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <Fonts customFonts={page.fonts || []} />
            {slides.map(slide => (
                <section
                    key={slide.id}
                    className="min-h-screen w-full flex flex-col justify-center items-center relative py-12 px-4"
                    style={{ backgroundColor: slide.background || '#fff' }}
                >
                    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                        {(slide.elements || []).map(element => (
                            <ElementRenderer key={element.id} element={element} pageId={page.id} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function ElementRenderer({ element, pageId }: { element: PageElement, pageId: number }) {
    const commonStyle: any = {
        textAlign: element.props.align,
        paddingTop: element.props.paddingY,
        paddingBottom: element.props.paddingY,
        paddingLeft: element.props.paddingX,
        paddingRight: element.props.paddingX,
        marginTop: element.props.marginTop,
        marginBottom: element.props.marginBottom,
        backgroundColor: element.props.backgroundColor,
        borderRadius: element.props.borderRadius,
        fontFamily: element.props.fontFamily,
    };

    const content = () => {
        switch (element.type) {
            case 'text':
                return (
                    <p style={{
                        fontSize: element.props.fontSize,
                        color: element.props.color,
                        fontWeight: element.props.fontWeight
                    }}>
                        {element.props.content}
                    </p>
                );
            case 'image':
                return (
                    <div className="flex" style={{ justifyContent: element.props.align === 'center' ? 'center' : element.props.align === 'right' ? 'flex-end' : 'flex-start' }}>
                        <img src={element.props.src} alt={element.props.alt} style={{ width: element.props.width, maxWidth: '100%', borderRadius: '8px' }} />
                    </div>
                );
            case 'button':
                return (
                    <div className="flex" style={{ justifyContent: element.props.align === 'center' ? 'center' : element.props.align === 'right' ? 'flex-end' : 'flex-start' }}>
                        <Button asChild variant={element.props.variant as any}>
                            <a href={element.props.link}>{element.props.text}</a>
                        </Button>
                    </div>
                );
            case 'video':
                return (
                    <div className="w-full flex justify-center">
                        <iframe
                            src={element.props.url}
                            style={{ width: '100%', height: element.props.height, borderRadius: '8px' }}
                            allowFullScreen
                            className="bg-black"
                        />
                    </div>
                );
            case 'map':
                return (
                    <div className="w-full">
                        <div className="w-full bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm p-4 border" style={{ height: element.props.height }}>
                            <p>Map Placeholder (Configuration Required)</p>
                        </div>
                    </div>
                );
            case 'divider':
                return (
                    <div className="w-full flex justify-center py-2">
                        <hr style={{
                            borderColor: element.props.color,
                            width: element.props.width,
                            borderTopStyle: element.props.style,
                            borderTopWidth: element.props.thickness
                        }} />
                    </div>
                );
            case 'spacer':
                return <div style={{ height: element.props.height, width: '100%' }} />;
            case 'countdown':
                return (
                    <div className="w-full flex justify-center">
                        <Countdown targetDate={element.props.targetDate} color={element.props.color} bgColor={element.props.bgColor} />
                    </div>
                );
            case 'rsvp':
                return (
                    <div className="w-full">
                        <RsvpForm title={element.props.title} description={element.props.description} pageId={pageId} />
                    </div>
                );
            case 'gallery':
                return (
                    <div className="w-full">
                        <Gallery images={(element.props.images || "").split('\n')} />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div style={{
            ...commonStyle,
            // Background properties should be on this outer wrapper
            backgroundImage: element.props.backgroundImage ? `url(${element.props.backgroundImage})` : undefined,
            backgroundSize: element.props.backgroundSize,
            backgroundPosition: element.props.backgroundPosition,
            backgroundRepeat: element.props.backgroundRepeat,
        }} className="w-full relative overflow-hidden group">
            {/* Background Overlay */}
            {element.props.overlayColor && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: element.props.overlayColor }}
                />
            )}

            {/* Content Wrapper - Relative to sit on top of overlay */}
            <div className="relative z-10">
                {content()}
            </div>
        </div>
    );
}
