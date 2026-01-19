"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createPageAction } from "@/modules/pages/actions/page.actions";

export default function NewPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/dashboard/pages" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pages
            </Link>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
                <p className="text-muted-foreground">Start by defining the basic details of your page.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Page Details</CardTitle>
                    <CardDescription>
                        You can edit the content in the next step.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createPageAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Page Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Wedding Invitation" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input id="slug" name="slug" placeholder="e.g. wedding-invite" required pattern="^[a-z0-9-]+$" title="Only lowercase letters, numbers, and hyphens" />
                            <p className="text-xs text-muted-foreground">
                                The URL for your page (e.g., yoursite.com/wedding-invite)
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="isPublished" name="isPublished" value="true" />
                            <Label htmlFor="isPublished">Publish immediately</Label>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href="/dashboard/pages">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Create & Open Editor</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
