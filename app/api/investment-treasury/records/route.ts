// ============================================================================
// Investment & Treasury API Route - GET /api/investment-treasury/records
// ============================================================================
// Mock API endpoint for Investment records list with pagination
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const recordStatus = searchParams.get("record_status");

    // Generate mock records
    const allRecords = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i % 12],
      region: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Kaduna"][i % 5],
      branch: `Branch ${i + 1}`,
      contributionsPrivateSector: Math.floor(Math.random() * 50000000) + 20000000,
      contributionsPublicTreasury: Math.floor(Math.random() * 35000000) + 15000000,
      contributionsPublicNonTreasury: Math.floor(Math.random() * 30000000) + 10000000,
      contributionsInformalEconomy: Math.floor(Math.random() * 20000000) + 5000000,
      rentalFees: Math.floor(Math.random() * 10000000) + 3000000,
      ecsRegistrationFees: Math.floor(Math.random() * 5000000) + 1000000,
      ecsCertificateFees: Math.floor(Math.random() * 4000000) + 800000,
      debtRecovered: Math.floor(Math.random() * 15000000) + 5000000,
      period: new Date().toISOString().slice(0, 7),
      recordStatus: ["pending", "reviewed", "approved"][i % 3],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
      reviewedBy: i % 3 === 0 ? null : "John Manager",
      approvedBy: i % 3 === 2 ? "Jane Admin" : null,
    }));

    // Apply status filter
    let filtered = recordStatus
      ? allRecords.filter((r) => r.recordStatus === recordStatus)
      : allRecords;

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const records = filtered.slice(start, end);

    return NextResponse.json(
      {
        records,
        total: filtered.length,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Investment records API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
