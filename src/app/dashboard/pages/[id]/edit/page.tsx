import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPageById } from "@/modules/pages/actions/page.actions";
import PageBuilder from "@/modules/pages/components/page-builder";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pageId = parseInt(id);
    if (isNaN(pageId)) notFound();

    const page = await getPageById(pageId);
    if (!page) notFound();

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/pages">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{page.title}</h1>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/${page.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Live
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <PageBuilder page={page} />
            </div>
        </div>
    );
}
