import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  colorScheme?: "green" | "blue" | "purple" | "orange" | "gray";
  description?: string;
  subtitle?: string;
  trend?: string | number;
}

const colorSchemes = {
  green: "bg-green-50 border-green-200 hover:shadow-green-100",
  blue: "bg-blue-50 border-blue-200 hover:shadow-blue-100",
  purple: "bg-purple-50 border-purple-200 hover:shadow-purple-100",
  orange: "bg-orange-50 border-orange-200 hover:shadow-orange-100",
  gray: "bg-gray-50 border-gray-200 hover:shadow-gray-100",
};

const iconColors = {
  green: "text-green-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  gray: "text-gray-600",
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  colorScheme = "green",
  description,
  subtitle,
  trend,
}) => {
  return (
    <div
      className={`${colorSchemes[colorScheme]} p-2.5 rounded-lg border transition-all hover:shadow-md`}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
          {title}
        </p>
        {icon && (
          <div
            className={`opacity-60 ${iconColors[colorScheme]} text-xs`}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {change && (
        <p className="text-xs text-green-600 mt-0.5 font-medium">{change}</p>
      )}
      {trend && (
        <p className="text-xs text-blue-600 mt-0.5 font-medium">
          {typeof trend === "string" && (trend === "up" || trend === "down")
            ? `Trend: ${trend}`
            : `Trend: ${trend}`}
        </p>
      )}
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
  );
};

export const MetricsGrid: React.FC<{
  children: React.ReactNode;
  columns?: 4 | 5 | 6;
}> = ({ children, columns = 5 }) => {
  const gridCols = {
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols[columns]} gap-2 sm:gap-3`}
    >
      {children}
    </div>
  );
};
