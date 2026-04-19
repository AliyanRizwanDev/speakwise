import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";

export const runtime = "nodejs";

const safeFilename = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

const uploadToBlob = async (pathname: string, file: File) => {
  try {
    return await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isPrivateStoreMismatch = message.includes(
      "Cannot use private access on a public store",
    );

    if (!isPrivateStoreMismatch) {
      throw error;
    }

    return put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });
  }
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const userIdRaw = formData.get("userId");
    const userId =
      typeof userIdRaw === "string" && userIdRaw.trim().length > 0
        ? userIdRaw.trim()
        : "temp";

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

    const { insertedId } = await db.collection("meetings").insertOne(meeting);

    return NextResponse.json(
      {
        meetingId: insertedId.toString(),
        blobUrl: blob.url,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
