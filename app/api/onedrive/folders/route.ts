import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Get the authenticated Next.js session
    const session = await auth();
    console.log("OneDrive API: session exists?", !!session);

    // @ts-expect-error accessToken dynamic cast
    const accessToken = session?.accessToken;
    console.log("OneDrive API: accessToken exists?", !!accessToken);

    if (!session || !accessToken) {
      console.warn("OneDrive API: Unauthorized access attempt (no session/token)");
      return NextResponse.json(
        { error: "Unauthorized. Missing active session or access token." },
        { status: 401 }
      );
    }

    // 2. Fetch children of the OneDrive root from Microsoft Graph API
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/drive/root/children?$select=id,name,folder,webUrl",
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

    if (!data || !data.value) {
      console.warn("Graph API returned empty or unexpected data format:", data);
      return NextResponse.json({ folders: [] }, { status: 200 });
    }

    // 3. Filter the response to ONLY return items that are folders
    const folders = data.value
      .filter((item: any) => item.folder)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        webUrl: item.webUrl,
      }));

    return NextResponse.json({ folders }, { status: 200 });
  } catch (error: any) {
    console.error("Internal Server Error in /api/onedrive/folders:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error.message || "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
