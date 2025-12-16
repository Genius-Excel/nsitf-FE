import React from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
  className?: string;
}

/**
 * ChartCard - Reusable wrapper for all chart components
 *
 * Provides consistent styling for charts across all modules
 * with gradient background, border, and title section
 *
 * @example
 * <ChartCard title="Monthly Trends" description="Last 6 months" height={300}>
 *   <ResponsiveContainer width="100%" height="100%">
 *     <BarChart data={data}>...</BarChart>
 *   </ResponsiveContainer>
 * </ChartCard>
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  height = 200,
  className = "",
}) => {
  return (
    <div className={`border shadow-sm bg-gradient-to-br from-white to-gray-50 rounded-lg ${className}`}>
      {/* Chart Header */}
      <div className="p-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-[10px] text-gray-600 mt-0.5">{description}</p>
        )}
      </div>

      {/* Chart Content */}
      <div className="p-2">
        <div className="w-full" style={{ height: `${height}px` }}>
          {children}
        </div>
      </div>
    </div>
  );
};
