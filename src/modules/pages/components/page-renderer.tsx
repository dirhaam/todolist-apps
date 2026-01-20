'use client';

import { Page, PageSlide, PageElement } from "../schemas/page.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Templates } from "@/components/landing/templates";
import { Footer } from "@/components/landing/footer";
import { Type, Image as ImageIcon, Box, Video, Map, Minus, GripHorizontal, Timer, ClipboardList, Images, Star, List, Grid, Layout } from "lucide-react";
import { useEffect, useState } from "react";

export default function PageRenderer({ page }: { page: Page }) {
    const [slides, setSlides] = useState<PageSlide[]>([]);
    const [fonts, setFonts] = useState<{ name: string, url: string }[]>([]);

    useEffect(() => {
        console.log('=== CLIENT-SIDE PageRenderer MOUNTED ===');
        
        let parsedSlides: PageSlide[] = [];
        try {
            if (typeof page.content === 'string') {
                parsedSlides = JSON.parse(page.content);
            } else if (Array.isArray(page.content)) {
                parsedSlides = page.content;
            }
        } catch (e) {
            console.error("Failed to parse page content:", e);
        }

        let parsedFonts: { name: string, url: string }[] = [];
        try {
            if (typeof page.fonts === 'string') {
                parsedFonts = JSON.parse(page.fonts);
            } else if (Array.isArray(page.fonts)) {
                parsedFonts = page.fonts;
            }
        } catch (e) {
            console.error("Failed to parse page fonts:", e);
        }

        console.log("CLIENT: PageRenderer Slides:", parsedSlides.length);
        parsedSlides.forEach((s, i) => {
            console.log(`CLIENT: Slide ${i} name:`, s.name);
            console.log(`CLIENT: Slide ${i} has ${s.elements.length} elements`);
            s.elements.forEach((el, idx) => {
                console.log(`CLIENT: Slide ${i} Element ${idx}: type="${el.type}", hasNestedElements=${!!el.elements}, nestedCount=${el.elements?.length || 0}`);
                if (el.type === 'container') {
                    console.log(`CLIENT: ⚠️ CONTAINER DETECTED in slide ${i}, element ${idx}`);
                    console.log(`CLIENT: Container elements:`, el.elements);
                }
            });
        });

        setSlides(parsedSlides);
        setFonts(parsedFonts);
    }, [page]);

    return (
        <div className="min-h-screen bg-white">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Inter:wght@100..900&family=Lato:wght@100..900&family=Merriweather:wght@300;400;700&family=Montserrat:wght@100..900&family=Open+Sans:wght@300..800&family=Playfair+Display:wght@400..900&family=Roboto:wght@100..900&display=swap');
                ${fonts.map(f => `
                @font-face {
                    font-family: '${f.name}';
                    src: url('${f.url}');
                }
            `).join('\n') || ''}
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes zoomIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .transition-fade { animation: fadeIn 0.8s ease-out; }
            .transition-slide-left { animation: slideInLeft 0.8s ease-out; }
            .transition-slide-right { animation: slideInRight 0.8s ease-out; }
            .transition-zoom { animation: zoomIn 0.8s ease-out; }
            `}} />

            {slides.map((slide) => (
                <SlideRenderer key={slide.id} slide={slide} />
            ))}
        </div>
    );
}

function SlideRenderer({ slide }: { slide: PageSlide }) {
    useEffect(() => {
        // Execute custom script for this slide
        if (slide.script && slide.script.trim()) {
            try {
                // Create a safer execution context
                const executeScript = new Function(slide.script);
                executeScript();
            } catch (error) {
                console.error(`Error executing script for slide ${slide.name}:`, error);
            }
        }
    }, [slide.script, slide.name]);

    const transitionClass = slide.transition && slide.transition !== 'none' 
        ? `transition-${slide.transition}` 
        : '';

    return (
        <div 
            className={`relative w-full ${transitionClass}`} 
            style={{ backgroundColor: slide.background }}
        >
             {/* Elements Render */}
             <div className="max-w-7xl mx-auto relative px-4 py-8 md:px-8">
                {slide.elements.map(element => (
                    <ElementRenderer key={element.id} element={element} />
                ))}
            </div>
        </div>
    );
}

function ElementRenderer({ element }: { element: PageElement }) {
    console.log(`DEBUG: Rendering element ${element.type}`);
    // ... rest of component
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
                        <img src={element.props.src} alt="Element" style={{ width: element.props.width, maxWidth: '100%', borderRadius: '8px' }} />
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
                        <div className="w-full bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm p-4 border block" style={{ height: element.props.height }}>
                            <p>Map View (Placeholder)</p>
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
                    <div className="p-4 rounded-xl text-center" style={{ backgroundColor: element.props.bgColor, color: element.props.color }}>
                        <p className="text-xs uppercase tracking-widest mb-2">Countdown to</p>
                        <p className="text-xl font-bold">{new Date(element.props.targetDate).toLocaleDateString('en-GB')}</p>
                         <div className="grid grid-cols-4 gap-2 mt-4 text-sm font-mono">
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">DAYS</div></div>
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">HRS</div></div>
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">MIN</div></div>
                            <div className="bg-white/20 rounded p-1">00<div className="text-[8px]">SEC</div></div>
                        </div>
                    </div>
                );
            case 'rsvp':
                return (
                    <div className="p-6 bg-white rounded-xl shadow-sm border text-center">
                        <h3 className="font-bold text-lg mb-2">{element.props.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{element.props.description}</p>
                        <div className="space-y-3 opacity-50">
                            <Input placeholder="Your Name" disabled />
                            <select className="w-full border rounded p-2 text-sm" disabled><option>Will Attend</option></select>
                            <Button className="w-full" disabled>Send RSVP</Button>
                        </div>
                    </div>
                );
            case 'gallery':
                const images = (element.props.images || "").split('\n').filter((url: string) => url.trim() !== "");
                return (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {images.map((url: string, i: number) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                            </div>
                        ))}
                    </div>
                );
            case 'hero':
                return <Hero {...element.props} />;
            case 'features':
                return <Features {...element.props} />;
            case 'templates':
                return <Templates {...element.props} />;
            case 'footer':
                return <Footer {...element.props} />;
            case 'container':
                console.log('DEBUG: Container found');
                console.log('DEBUG: Container element object:', JSON.stringify(element, null, 2));
                console.log('DEBUG: element.elements type:', typeof element.elements);
                console.log('DEBUG: element.elements is array?', Array.isArray(element.elements));
                console.log('DEBUG: element.elements value:', element.elements);
                console.log('DEBUG: element.elements length:', element.elements?.length);
                
                const layoutStyle: React.CSSProperties = element.props.layout === 'grid'
                    ? { 
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${element.props.columns || 2}, 1fr)`, 
                        gap: element.props.gap || '16px' 
                    }
                    : { 
                        display: 'flex', 
                        flexDirection: (element.props.layout === 'vertical' ? 'column' : 'row') as 'row' | 'column', 
                        gap: element.props.gap || '16px', 
                        justifyContent: element.props.justifyContent || element.props.justify || 'flex-start', 
                        alignItems: element.props.alignItems || element.props.align || 'flex-start', 
                        flexWrap: (element.props.flexWrap || (element.props.wrap ? 'wrap' : 'nowrap')) as 'wrap' | 'nowrap' | 'wrap-reverse'
                    };
                
                return (
                    <div style={{ ...layoutStyle, width: '100%', height: '100%' }}>
                        {element.elements && element.elements.map((child, idx) => {
                            return <ElementRenderer key={child.id} element={child} />;
                        })}
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div style={{
            ...commonStyle,
            // Sizing override
            width: element.props.width || '100%',
            height: element.props.height || 'auto',
            backgroundImage: element.props.backgroundImage ? `url(${element.props.backgroundImage})` : undefined,
            backgroundSize: element.props.backgroundSize,
            backgroundPosition: element.props.backgroundPosition,
            backgroundRepeat: element.props.backgroundRepeat,
        }} className="relative overflow-hidden">
             {/* Background Overlay */}
            {element.props.overlayColor && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: element.props.overlayColor }}
                />
            )}

            {/* Content Wrapper */}
            <div className="relative z-10">
                {content()}
            </div>
        </div>
    );
}
