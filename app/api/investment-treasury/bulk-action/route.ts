// ============================================================================
// Investment & Treasury API Route - POST /api/investment-treasury/bulk-action
// ============================================================================
// Mock API endpoint for bulk review/approve actions
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Record IDs are required" },
        { status: 400 }
      );
    }

    if (!action || !["review", "approve"].includes(action)) {
      return NextResponse.json(
        { error: "Valid action (review/approve) is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Investment bulk action:", { action, recordCount: ids.length });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock success response
    return NextResponse.json(
      {
        success: true,
        message: `${ids.length} record(s) ${action}ed successfully`,
        updated: ids,
        missing: [],
        errors: [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Investment bulk action API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process bulk action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
