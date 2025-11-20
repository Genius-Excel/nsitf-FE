import { useMemo } from "react";
import {
  MonthlyChart,
  ChartData,
  transformChartData,
} from "@/lib/types/claims";

interface UseClaimsChartsParams {
  monthlyChart: MonthlyChart | null;
}

interface UseClaimsChartsReturn {
  chartData: ChartData[];
  maxValue: number;
  ticks: number[];
}

/**
 * Transforms and memoizes chart data for recharts consumption
 * Keeps claims_processed field as snake_case as requested
 *
 * @param params.monthlyChart - Raw chart data from API
 *
 * @returns Transformed chart data ready for recharts
 *
 * @example
 * ```tsx
 * const { chartData, maxValue } = useClaimsCharts({ monthlyChart });
 *
 * <BarChart data={chartData}>
 *   <Bar dataKey="claims_processed" />
 *   <Bar dataKey="target" />
 * </BarChart>
 * ```
 */
export const useClaimsCharts = (
  params: UseClaimsChartsParams
): UseClaimsChartsReturn => {
  const { monthlyChart } = params;

  const chartData = useMemo(() => {
    if (!monthlyChart || !monthlyChart.data) {
      return [];
    }
    return transformChartData(monthlyChart);
  }, [monthlyChart]);

  const maxValue = useMemo(() => {
    return monthlyChart?.scale?.max || 0;
  }, [monthlyChart]);

  const ticks = useMemo(() => {
    return monthlyChart?.scale?.ticks || [];
  }, [monthlyChart]);

  return {
    chartData,
    maxValue,
    ticks,
  };
};
