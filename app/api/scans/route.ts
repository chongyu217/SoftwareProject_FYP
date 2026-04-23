import { NextResponse } from "next/server";
import { getDbData, saveDbData } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folder, template, status } = body;

    if (!folder || !template) {
      return NextResponse.json({ error: "Missing folder or template fields" }, { status: 400 });
    }

    const db = await getDbData();
    if (!db) {
      return NextResponse.json({ error: "Database not found" }, { status: 500 });
    }

    // Generate current formatted date
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const calculatedCompliance = status === "Completed" ? 100 : Math.floor(Math.random() * (79 - 40) + 40);

    // New scan record
    const newRecord = {
      id: Date.now().toString(),
      folder: folder,
      template: template,
      date: dateStr,
      status: status || (calculatedCompliance > 80 ? "Completed" : "Review Needed"),
      compliance: calculatedCompliance
    };

    // Update stats
    db.stats.recentScans.unshift(newRecord); // add to top
    db.stats.totalFoldersScanned += 1;
    db.stats.lastScanDate = dateStr;

    // Persist
    const success = await saveDbData(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: newRecord });
  } catch (error) {
    console.error("API /api/scans Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
