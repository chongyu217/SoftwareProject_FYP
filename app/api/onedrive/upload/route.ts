import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    // @ts-expect-error accessToken dynamic cast
    const accessToken = session?.accessToken;

    if (!session || !accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Missing active session or access token." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string;

    if (!file || !folderId) {
      return NextResponse.json(
        { error: "Missing file or folderId" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Microsoft Graph PUT API for small files (up to 4MB)
    // For larger files, an upload session would be required.
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${file.name}:/content`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OneDrive Upload Error:", errorData);
      return NextResponse.json(
        { 
          error: "Failed to upload file to OneDrive.",
          details: errorData.error?.message || "Unknown Graph Error",
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, item: data }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
