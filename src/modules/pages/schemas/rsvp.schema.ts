import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { pages } from "./page.schema";

export const rsvps = sqliteTable("rsvps", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageId: integer("page_id")
        .notNull()
        .references(() => pages.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    message: text("message"),
    status: text("status", { enum: ["attending", "not_attending", "maybe"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .defaultNow()
        .notNull(),
});

export const insertRsvpSchema = createInsertSchema(rsvps);

export type Rsvp = typeof rsvps.$inferSelect;
