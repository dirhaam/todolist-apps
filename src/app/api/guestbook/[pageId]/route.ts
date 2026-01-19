import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { guestbook, guestbookLikes } from "@/modules/guestbook/schemas/guestbook.schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await params;
        const db = await getDb();

        // Fetch all guestbook entries for this page
        const entries = await db
            .select()
            .from(guestbook)
            .where(eq(guestbook.pageId, parseInt(pageId)))
            .orderBy(guestbook.createdAt);

        // Organize entries with nested replies
        const entriesMap = new Map();
        const rootEntries: any[] = [];

        entries.forEach(entry => {
            entriesMap.set(entry.id, { ...entry, replies: [] });
        });

        entries.forEach(entry => {
            const entryWithReplies = entriesMap.get(entry.id);
            if (entry.parentId) {
                const parent = entriesMap.get(entry.parentId);
                if (parent) {
                    parent.replies.push(entryWithReplies);
                }
            } else {
                rootEntries.push(entryWithReplies);
            }
        });

        return NextResponse.json(rootEntries);
    } catch (error) {
        console.error("Error fetching guestbook entries:", error);
        return NextResponse.json(
            { error: "Failed to fetch entries" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await params;
        const body = await request.json();
        const { name, message, parentId } = body;

        if (!name || !message) {
            return NextResponse.json(
                { error: "Name and message are required" },
                { status: 400 }
            );
        }

        const db = await getDb();
        
        const [entry] = await db
            .insert(guestbook)
            .values({
                pageId: parseInt(pageId),
                name,
                message,
                parentId: parentId || null,
            })
            .returning();

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        console.error("Error creating guestbook entry:", error);
        return NextResponse.json(
            { error: "Failed to create entry" },
            { status: 500 }
        );
    }
}
