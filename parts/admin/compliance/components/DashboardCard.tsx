import React from "react";

interface DashboardCardProps {
  title?: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  bgColor = "bg-white",
}) => {
  return (
    <div className={`p-4 rounded-lg shadow-md ${bgColor} flex items-center gap-4`}>
      {icon && <div className="text-2xl">{icon}</div>}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};
