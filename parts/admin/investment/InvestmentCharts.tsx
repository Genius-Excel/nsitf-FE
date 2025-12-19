// ============================================================================
// Investment Charts Component
// ============================================================================
// Contains all chart visualizations for Investment & Treasury module
// ============================================================================

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/design-system/ChartCard";
import type {
  MonthlyContributionTrend,
  DebtRecoveryPerformance,
} from "@/lib/types/investment";

interface InvestmentChartsProps {
  monthlyContributionTrend: MonthlyContributionTrend | null;
  debtRecoveryPerformance: DebtRecoveryPerformance | null;
}

// ============================================================================
// Custom Tooltip for Currency Formatting
// ============================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-xs text-gray-700"
            style={{ color: entry.color }}
          >
            {entry.name}: ₦{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// Monthly Contributions Trend Chart (Line Chart)
// ============================================================================
const ContributionsTrendChart: React.FC<{
  data: MonthlyContributionTrend;
}> = ({ data }) => {
  return (
    <ChartCard
      title="Monthly Contribution Trends"
      description="Tracking collections over time"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data.data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6b7280" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            domain={[0, data.scale.max]}
            ticks={data.scale.ticks}
            tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "11px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="private_sector"
            stroke="#16a34a"
            strokeWidth={2}
            name="Private Sector"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="public_treasury"
            stroke="#2563eb"
            strokeWidth={2}
            name="Public Treasury"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="public_non_treasury"
            stroke="#9333ea"
            strokeWidth={2}
            name="Public Non-Treasury"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="informal_economy"
            stroke="#ea580c"
            strokeWidth={2}
            name="Informal Economy"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="rental_fees"
            stroke="#6b7280"
            strokeWidth={2}
            name="Rental Fees"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// ============================================================================
// Debt Recovery vs Contributions Chart (Bar Chart)
// ============================================================================
const DebtRecoveryChart: React.FC<{
  data: DebtRecoveryPerformance;
}> = ({ data }) => {
  return (
    <ChartCard
      title="Debt Recovery Performance"
      description="Comparing debt recovered to total contributions"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6b7280" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            domain={[0, data.scale.max]}
            ticks={data.scale.ticks}
            tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "11px" }} iconType="rect" />
          <Bar
            dataKey="total_contributions"
            fill="#16a34a"
            name="Total Contributions"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="total_debt_recovered"
            fill="#ea580c"
            name="Debt Recovered"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// ============================================================================
// Main Charts Container
// ============================================================================
export const InvestmentCharts: React.FC<InvestmentChartsProps> = ({
  monthlyContributionTrend,
  debtRecoveryPerformance,
}) => {
  if (
    !monthlyContributionTrend ||
    !debtRecoveryPerformance ||
    monthlyContributionTrend.data.length === 0
  ) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Monthly Contribution Trends"
          description="Tracking collections over time"
          height={300}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">
              No data available
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Adjust filters to view analytics
            </p>
          </div>
        </ChartCard>

        <ChartCard
          title="Debt Recovery Performance"
          description="Comparing debt recovered to contributions"
          height={300}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">
              No data available
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Adjust filters to view analytics
            </p>
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <ContributionsTrendChart data={monthlyContributionTrend} />
      <DebtRecoveryChart data={debtRecoveryPerformance} />
    </div>
  );
};
