import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { guestbook, guestbookLikes } from "@/modules/guestbook/schemas/guestbook.schema";
import { eq, and, sql } from "drizzle-orm";
import { cookies } from "next/headers";

// Get or create session ID for tracking likes
async function getSessionId() {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("guestbook_session")?.value;
    
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        cookieStore.set("guestbook_session", sessionId, {
            maxAge: 365 * 24 * 60 * 60, // 1 year
            httpOnly: true,
            sameSite: "lax"
        });
    }
    
    return sessionId;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const guestbookId = parseInt(id);
        const sessionId = await getSessionId();
        const db = await getDb();

        // Check if user already liked this entry
        const existingLike = await db
            .select()
            .from(guestbookLikes)
            .where(
                and(
                    eq(guestbookLikes.guestbookId, guestbookId),
                    eq(guestbookLikes.sessionId, sessionId)
                )
            )
            .limit(1);

        if (existingLike.length > 0) {
            // Unlike: Remove like and decrement count
            await db
                .delete(guestbookLikes)
                .where(eq(guestbookLikes.id, existingLike[0].id));

            await db
                .update(guestbook)
                .set({ likesCount: sql`${guestbook.likesCount} - 1` })
                .where(eq(guestbook.id, guestbookId));

            return NextResponse.json({ liked: false });
        } else {
            // Like: Add like and increment count
            await db.insert(guestbookLikes).values({
                guestbookId,
                sessionId,
            });

            await db
                .update(guestbook)
                .set({ likesCount: sql`${guestbook.likesCount} + 1` })
                .where(eq(guestbook.id, guestbookId));

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json(
            { error: "Failed to toggle like" },
            { status: 500 }
        );
    }
}
