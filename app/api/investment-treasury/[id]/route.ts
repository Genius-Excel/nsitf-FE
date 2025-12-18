// ============================================================================
// Investment & Treasury API Route - GET/PATCH /api/investment-treasury/:id
// ============================================================================
// Mock API endpoint for single record operations
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    console.log("📄 Fetching investment record:", id);

    // Mock single record
    const record = {
      id,
      month: "December",
      region: "Lagos",
      branch: "Ikeja Branch",
      contributionsPrivateSector: 45000000,
      contributionsPublicTreasury: 32000000,
      contributionsPublicNonTreasury: 28000000,
      contributionsInformalEconomy: 15000000,
      rentalFees: 8500000,
      ecsRegistrationFees: 3200000,
      ecsCertificateFees: 2800000,
      debtRecovered: 12000000,
      period: new Date().toISOString().slice(0, 7),
      recordStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewedBy: null,
      approvedBy: null,
    };

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error("❌ Get investment record error:", error);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    console.log("✏️ Updating investment record:", id, body);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock updated record
    const updatedRecord = {
      id,
      ...body,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Record updated successfully",
        data: updatedRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Update investment record error:", error);
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 }
    );
  }
}
