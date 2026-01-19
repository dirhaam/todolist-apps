import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { pages } from "@/modules/pages/schemas/page.schema";

export const guestbook = sqliteTable("guestbook", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageId: integer("page_id")
        .notNull()
        .references(() => pages.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    message: text("message").notNull(),
    parentId: integer("parent_id"), // For replies
    likesCount: integer("likes_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .defaultNow(),
});

export const guestbookLikes = sqliteTable("guestbook_likes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    guestbookId: integer("guestbook_id")
        .notNull()
        .references(() => guestbook.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull(), // UUID to track unique likes
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .defaultNow(),
});

export type GuestbookEntry = typeof guestbook.$inferSelect;
export type NewGuestbookEntry = typeof guestbook.$inferInsert;
export type GuestbookLike = typeof guestbookLikes.$inferSelect;
export type NewGuestbookLike = typeof guestbookLikes.$inferInsert;
