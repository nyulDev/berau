import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: unknown = body?.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    // keep only string ids
    const stringIds = ids.filter((id) => typeof id === "string");
    if (stringIds.length === 0) {
      return NextResponse.json(
        { error: "No valid ids provided" },
        { status: 400 },
      );
    }

    const result = await db.flight.deleteMany({
      where: {
        id: { in: stringIds },
      },
    });

    return NextResponse.json({ deletedCount: result.count }, { status: 200 });
  } catch (error) {
    console.error("Error multi-deleting flights:", error);
    return NextResponse.json(
      { error: "Failed to multi-delete flights" },
      { status: 500 },
    );
  }
}
