import Link from "next/link";
import { Plus, FileText, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPages, deletePageAction } from "@/modules/pages/actions/page.actions";

export default async function PagesList() {
    const pages = await getPages();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">Manage your custom landing pages.</p>
                </div>
                <Link href="/dashboard/pages/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Page
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Pages</CardTitle>
                    <CardDescription>
                        A list of all pages you have created.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No pages found. Create one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pages.map((page) => (
                                    <TableRow key={page.id}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell>
                                            <code className="bg-gray-100 rounded px-1 text-sm">{page.slug}</code>
                                        </TableCell>
                                        <TableCell>
                                            {page.isPublished ? (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 hover:bg-green-100/80">
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100/80">
                                                    Draft
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{page.createdAt.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/${page.slug}`} target="_blank">
                                                <Button variant="ghost" size="icon" title="View">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/dashboard/pages/${page.id}/edit`}>
                                                <Button variant="ghost" size="icon" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <form action={deletePageAction.bind(null, page.id)} className="inline-block">
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
