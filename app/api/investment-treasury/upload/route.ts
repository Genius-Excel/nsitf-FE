// ============================================================================
// Investment & Treasury API Route - POST /api/investment-treasury/upload
// ============================================================================
// Mock API endpoint for uploading Investment records
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const period = formData.get("period") as string;
    const regionId = formData.get("region_id") as string;
    const branchId = formData.get("branch_id") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!period) {
      return NextResponse.json(
        { error: "Period is required" },
        { status: 400 }
      );
    }

    console.log("📤 Investment upload received:", {
      fileName: file.name,
      fileSize: file.size,
      period,
      regionId,
      branchId,
    });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock success response
    return NextResponse.json(
      {
        success: true,
        message: "Investment records uploaded successfully",
        recordCount: Math.floor(Math.random() * 20) + 5,
        summary: {
          created: Math.floor(Math.random() * 15) + 3,
          updated: Math.floor(Math.random() * 5) + 1,
          errors: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Investment upload API error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload investment records",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
