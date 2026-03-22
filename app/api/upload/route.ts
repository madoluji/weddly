import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    if (!file) {
        return NextResponse.json("No file selected");
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const path = join("C:/Users/shres/Desktop/imageupload/image-upload/app/static", file.name);
    await writeFile(path, new Uint8Array(buffer));

    // Convert the binary file buffer to Base64 format


    return NextResponse.json({ message: "Image uploaded successfully", });
}