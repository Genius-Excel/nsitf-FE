import React from "react";

interface Props {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  ariaLabel?: string;
}

export const MetricCard: React.FC<Props> = ({ label, value, icon, colorClass, ariaLabel }) => (
  <div className={`${colorClass} p-4 sm:p-5 rounded-lg border transition-all hover:shadow-md`} role="article" aria-label={ariaLabel}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
      <div className="opacity-60">{icon}</div>
    </div>
    <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{value}</p>
  </div>
);
