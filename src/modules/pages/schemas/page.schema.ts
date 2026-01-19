import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// New Hierarchy: Page -> Slides[] -> Elements[]
export type ElementType = "text" | "image" | "button" | "divider" | "video" | "map" | "spacer" | "countdown" | "rsvp" | "gallery";

export interface PageElement {
    id: string;
    type: ElementType;
    props: Record<string, any>;
}

export type CustomFont = {
    name: string;
    url: string;
};

export interface PageSlide {
    id: string;
    name: string; // e.g., "Cover", "Date", "Gallery"
    elements: PageElement[];
    background?: string; // hex color or image url
}

export const pages = sqliteTable("pages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    content: text("content", { mode: "json" }).$type<PageSlide[]>().default([]),
    isPublished: integer("is_published", { mode: "boolean" })
        .notNull()
        .default(false),
    fonts: text("fonts", { mode: "json" }).$type<{ name: string, url: string }[]>().default([]),
    createdAt: integer("created_at", { mode: "timestamp" })
        .defaultNow()
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const insertPageSchema = createInsertSchema(pages, {
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    content: true,
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
