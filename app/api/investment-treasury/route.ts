// ============================================================================
// Investment & Treasury API Route - GET /api/investment-treasury
// ============================================================================
// Mock API endpoint for Investment dashboard data
// TODO: Replace with actual backend proxy when endpoint is available
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mock data generator
function generateMockData() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  // Generate sample records
  const records = [
    {
      id: "1",
      month: "December",
      contributionsPrivateSector: 45000000,
      contributionsPublicTreasury: 32000000,
      contributionsPublicNonTreasury: 28000000,
      contributionsInformalEconomy: 15000000,
      rentalFees: 8500000,
      ecsRegistrationFees: 3200000,
      ecsCertificateFees: 2800000,
      debtRecovered: 12000000,
      period: currentMonth,
      recordStatus: "approved",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: "John Manager",
      approvedBy: "Jane Admin",
      region: "Lagos",
      branch: "Ikeja Branch",
    },
    {
      id: "2",
      month: "December",
      contributionsPrivateSector: 38000000,
      contributionsPublicTreasury: 25000000,
      contributionsPublicNonTreasury: 22000000,
      contributionsInformalEconomy: 12000000,
      rentalFees: 7200000,
      ecsRegistrationFees: 2800000,
      ecsCertificateFees: 2400000,
      debtRecovered: 9500000,
      period: currentMonth,
      recordStatus: "reviewed",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: "John Manager",
      approvedBy: null,
      region: "Abuja",
      branch: "Central Branch",
    },
    {
      id: "3",
      month: "December",
      contributionsPrivateSector: 28000000,
      contributionsPublicTreasury: 18000000,
      contributionsPublicNonTreasury: 16000000,
      contributionsInformalEconomy: 8000000,
      rentalFees: 5500000,
      ecsRegistrationFees: 2100000,
      ecsCertificateFees: 1800000,
      debtRecovered: 7000000,
      period: currentMonth,
      recordStatus: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: null,
      approvedBy: null,
      region: "Port Harcourt",
      branch: "Main Branch",
    },
    {
      id: "4",
      month: "December",
      contributionsPrivateSector: 22000000,
      contributionsPublicTreasury: 15000000,
      contributionsPublicNonTreasury: 13000000,
      contributionsInformalEconomy: 6500000,
      rentalFees: 4800000,
      ecsRegistrationFees: 1900000,
      ecsCertificateFees: 1600000,
      debtRecovered: 5500000,
      period: currentMonth,
      recordStatus: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: null,
      approvedBy: null,
      region: "Kano",
      branch: "Regional Office",
    },
  ];

  // Calculate current totals
  const currentTotals = records.reduce(
    (acc, record) => ({
      contributionsPrivateSector:
        acc.contributionsPrivateSector + record.contributionsPrivateSector,
      contributionsPublicTreasury:
        acc.contributionsPublicTreasury + record.contributionsPublicTreasury,
      contributionsPublicNonTreasury:
        acc.contributionsPublicNonTreasury +
        record.contributionsPublicNonTreasury,
      contributionsInformalEconomy:
        acc.contributionsInformalEconomy + record.contributionsInformalEconomy,
      rentalFees: acc.rentalFees + record.rentalFees,
      debtRecovered: acc.debtRecovered + record.debtRecovered,
    }),
    {
      contributionsPrivateSector: 0,
      contributionsPublicTreasury: 0,
      contributionsPublicNonTreasury: 0,
      contributionsInformalEconomy: 0,
      rentalFees: 0,
      debtRecovered: 0,
    }
  );

  // Mock previous month values (10% less for demo)
  const previousTotals = {
    contributionsPrivateSector: currentTotals.contributionsPrivateSector * 0.9,
    contributionsPublicTreasury:
      currentTotals.contributionsPublicTreasury * 0.88,
    contributionsPublicNonTreasury:
      currentTotals.contributionsPublicNonTreasury * 0.92,
    contributionsInformalEconomy:
      currentTotals.contributionsInformalEconomy * 0.85,
    rentalFees: currentTotals.rentalFees * 0.95,
    debtRecovered: currentTotals.debtRecovered * 0.87,
  };

  // Calculate changes
  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    return { change, changePercent };
  };

  return {
    message: "Investment dashboard data retrieved successfully",
    metrics: {
      contributionsPrivateSector: {
        current: currentTotals.contributionsPrivateSector,
        previous: previousTotals.contributionsPrivateSector,
        ...calculateChange(
          currentTotals.contributionsPrivateSector,
          previousTotals.contributionsPrivateSector
        ),
      },
      contributionsPublicTreasury: {
        current: currentTotals.contributionsPublicTreasury,
        previous: previousTotals.contributionsPublicTreasury,
        ...calculateChange(
          currentTotals.contributionsPublicTreasury,
          previousTotals.contributionsPublicTreasury
        ),
      },
      contributionsPublicNonTreasury: {
        current: currentTotals.contributionsPublicNonTreasury,
        previous: previousTotals.contributionsPublicNonTreasury,
        ...calculateChange(
          currentTotals.contributionsPublicNonTreasury,
          previousTotals.contributionsPublicNonTreasury
        ),
      },
      contributionsInformalEconomy: {
        current: currentTotals.contributionsInformalEconomy,
        previous: previousTotals.contributionsInformalEconomy,
        ...calculateChange(
          currentTotals.contributionsInformalEconomy,
          previousTotals.contributionsInformalEconomy
        ),
      },
      rentalFees: {
        current: currentTotals.rentalFees,
        previous: previousTotals.rentalFees,
        ...calculateChange(currentTotals.rentalFees, previousTotals.rentalFees),
      },
      debtRecovered: {
        current: currentTotals.debtRecovered,
        previous: previousTotals.debtRecovered,
        ...calculateChange(
          currentTotals.debtRecovered,
          previousTotals.debtRecovered
        ),
      },
    },
    records,
    chartData: [
      {
        month: "Dec 2025",
        privateSector: currentTotals.contributionsPrivateSector,
        publicTreasury: currentTotals.contributionsPublicTreasury,
        publicNonTreasury: currentTotals.contributionsPublicNonTreasury,
        informalEconomy: currentTotals.contributionsInformalEconomy,
        rentalFees: currentTotals.rentalFees,
        debtRecovered: currentTotals.debtRecovered,
        totalContributions:
          currentTotals.contributionsPrivateSector +
          currentTotals.contributionsPublicTreasury +
          currentTotals.contributionsPublicNonTreasury +
          currentTotals.contributionsInformalEconomy,
      },
    ],
    totalRecords: records.length,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("region_id");
    const branchId = searchParams.get("branch_id");
    const period = searchParams.get("period");
    const periodFrom = searchParams.get("period_from");
    const periodTo = searchParams.get("period_to");
    const recordStatus = searchParams.get("record_status");

    console.log("📊 Investment API called with filters:", {
      regionId,
      branchId,
      period,
      periodFrom,
      periodTo,
      recordStatus,
    });

    // Generate mock data
    let data = generateMockData();

    // Apply filters if provided
    if (recordStatus && recordStatus !== "") {
      data.records = data.records.filter(
        (record) => record.record_status === recordStatus
      );
    }

    if (regionId) {
      data.records = data.records.filter((record) =>
        record.region.toLowerCase().includes(regionId.toLowerCase())
      );
    }

    if (branchId) {
      data.records = data.records.filter((record) =>
        record.branch.toLowerCase().includes(branchId.toLowerCase())
      );
    }

    // Update counts after filtering
    data.totalRecords = data.records.length;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Investment API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch investment data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
