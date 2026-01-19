"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, insertPageSchema, type PageSlide } from "../schemas/page.schema";

export async function createPageAction(formData: FormData) {
    const rawData = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        isPublished: formData.get("isPublished") === "true",
        content: [], // Empty content initially
    };

    const validated = insertPageSchema.parse(rawData);
    const db = await getDb();

    const [page] = await db.insert(pages).values(validated).returning();

    redirect(`/dashboard/pages/${page.id}/edit`);
}

export async function updatePageContentAction(id: number, content: PageSlide[], isPublished: boolean = false, fonts: { name: string, url: string }[] = []) {
    const db = await getDb();

    // Update and return the slug to revalidate
    const [updatedPage] = await db.update(pages)
        .set({ content, isPublished, fonts, updatedAt: new Date() })
        .where(eq(pages.id, id))
        .returning({ slug: pages.slug });

    revalidatePath(`/dashboard/pages/${id}/edit`);
    revalidatePath(`/dashboard/pages`);

    if (updatedPage) {
        revalidatePath(`/${updatedPage.slug}`);
    }
}

export async function updatePageMetadataAction(id: number, data: { title: string; slug: string; isPublished: boolean }) {
    const db = await getDb();
    await db.update(pages)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pages.id, id));

    revalidatePath(`/dashboard/pages/${id}/edit`);
    revalidatePath(`/dashboard/pages`);
}

export async function deletePageAction(id: number) {
    const db = await getDb();
    await db.delete(pages).where(eq(pages.id, id));
    revalidatePath("/dashboard/pages");
}

export async function getPages() {
    const db = await getDb();
    return db.select().from(pages).orderBy(desc(pages.createdAt));
}

export async function getPageById(id: number) {
    const db = await getDb();
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
}

export async function getPageBySlug(slug: string) {
    const db = await getDb();
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
}
