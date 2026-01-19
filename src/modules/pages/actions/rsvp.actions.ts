"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { rsvps, insertRsvpSchema } from "../schemas/rsvp.schema";

export async function submitRsvpAction(formData: FormData, pageId: number) {
    const rawData = {
        pageId: pageId,
        name: formData.get("name"),
        message: formData.get("message"),
        status: formData.get("status"),
    };

    const validated = insertRsvpSchema.parse(rawData);
    const db = await getDb();

    await db.insert(rsvps).values(validated);

    // Revalidate the page so the user might see updated counts if we were showing them (we aren't yet, but good practice)
    // We might not need to revalidate the public page if it doesn't show the list, but let's keep it clean.
}
