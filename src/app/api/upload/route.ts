import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";

// Force Node.js runtime for filesystem access
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename and make it unique
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

        // Define path to public/uploads
        // Note: process.cwd() in Next.js usually points to project root
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        // Return the public URL
        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: fileUrl });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
