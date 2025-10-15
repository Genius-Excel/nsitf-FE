"use client";
import React from "react";
import { Eye, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HSEActivity, StatCard } from "@/lib/types";
import { getActivityStatusColor } from "@/lib/utils";


export const StatisticsCards: React.FC<{ stats: StatCard[] }> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"></div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            </div>
            <div style={{ color: stat.bgColor }} className="text-2xl">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const RecentHSEActivities: React.FC<{
  activities: HSEActivity[];
}> = ({ activities }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">No activities found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent HSE Activities
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === activity.id ? null : activity.id)
              }
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1 text-xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.organization} • {activity.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${getActivityStatusColor(
                    activity.status
                  )} font-medium text-xs`}
                >
                  {activity.status}
                </Badge>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedId === activity.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {expandedId === activity.id && activity.details && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Details:</span>
                </p>
                <p className="text-sm text-gray-700">{activity.details}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Full Report
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonthlySummary: React.FC<{
  data: { label: string; value: number }[];
}> = ({ data }) => (
  <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Monthly HSE Summary
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((item, idx) => (
        <div key={idx}>
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ComplianceRate: React.FC<{
  percentage: number;
  change: string;
}> = ({ percentage, change }) => (
  <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Safety Compliance Rate
    </h2>
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-600 mt-1">Overall HSE</p>
        </div>
      </div>
    </div>
    <p className="text-center text-sm text-gray-600 mt-4">{change}</p>
  </div>
);