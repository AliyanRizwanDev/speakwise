import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

const safeFilename = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

const uploadToBlob = async (pathname: string, file: File) => {
  return put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
  });
};

export async function POST(request: Request) {
  try {
    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;

    if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Upload too large" },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const userId = request.headers.get("x-user-id")?.trim();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const fileName = safeFilename(file.name || "upload.bin");
    const pathname = `meetings/${Date.now()}-${fileName}`;

    const blob = await uploadToBlob(pathname, file);

    const client = await clientPromise;
    const db = client.db();

    const meeting = {
      userId,
      fileName: file.name,
      fileUrl: blob.url,
      status: "pending" as const,
      createdAt: new Date(),
    };

    try {
      const { insertedId } = await db.collection("meetings").insertOne(meeting);

      return NextResponse.json(
        {
          meetingId: insertedId.toString(),
          blobUrl: blob.url,
        },
        { status: 201 },
      );
    } catch (error) {
      await del(blob.url);
      throw error;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
