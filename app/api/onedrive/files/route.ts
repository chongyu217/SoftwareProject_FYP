import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId query parameter" }, { status: 400 });
    }

    // Fetch children of the specific folder ID from Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?$select=id,name,file,webUrl`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Graph API Error:", errorData);
      return NextResponse.json(
        { 
          error: "Failed to communicate with Microsoft Graph.",
          details: errorData.error?.message || "Unknown Graph Error",
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter to ONLY return files (ignoring sub-folders for the MVP)
    const files = data.value
      .filter((item: any) => item.file)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        webUrl: item.webUrl,
      }));

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
