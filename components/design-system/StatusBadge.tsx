import React from "react";
import { Badge } from "@/components/ui/badge";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * StatusBadge - Reusable badge component for status indicators
 *
 * Provides consistent color schemes for different status types
 * across all tables and components
 *
 * @example
 * <StatusBadge variant="success">Paid</StatusBadge>
 * <StatusBadge variant="warning">Pending</StatusBadge>
 * <StatusBadge variant="error">Rejected</StatusBadge>
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <Badge
      className={`${variantClasses[variant]} ${sizeClasses[size]} font-medium border ${className}`}
    >
      {children}
    </Badge>
  );
};

/**
 * Helper functions for status determination
 */
export const getStatusVariant = (status: string): BadgeVariant => {
  const statusLower = status.toLowerCase();

  if (["paid", "completed", "approved", "active", "validated"].includes(statusLower)) {
    return "success";
  }
  if (["pending", "in progress", "under review"].includes(statusLower)) {
    return "warning";
  }
  if (["rejected", "failed", "cancelled", "overdue"].includes(statusLower)) {
    return "error";
  }
  if (["processing", "submitted"].includes(statusLower)) {
    return "info";
  }
  return "neutral";
};

/**
 * Performance/Compliance Badge with color coding based on percentage
 */
export const PerformanceBadge: React.FC<{ value: number; showPercentage?: boolean }> = ({
  value,
  showPercentage = true,
}) => {
  const getVariant = (val: number): BadgeVariant => {
    if (val >= 80) return "success";
    if (val >= 60) return "warning";
    return "error";
  };

  return (
    <StatusBadge variant={getVariant(value)}>
      {value}
      {showPercentage && "%"}
    </StatusBadge>
  );
};
