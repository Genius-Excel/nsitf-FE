"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormattedCurrencyProps {
  amount: number;
  maxDigits?: number;
  className?: string;
  showSymbol?: boolean;
}

/**
 * Format amount with commas and proper truncation
 * @param amount - The amount to format
 * @param maxDigits - Maximum number of digits before truncation (default: 9)
 * @returns Formatted string
 */
const formatDisplayAmount = (amount: number, maxDigits: number = 9): string => {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // If the number has more digits than maxDigits, truncate with ellipsis
  const digitsOnly = formatted.replace(/,/g, "");
  if (digitsOnly.length > maxDigits) {
    // Take first maxDigits characters and re-add commas
    const truncated = digitsOnly.substring(0, maxDigits);
    const withCommas = Number(truncated).toLocaleString("en-US");
    return `${amount < 0 ? "-" : ""}${withCommas}...`;
  }

  return `${amount < 0 ? "-" : ""}${formatted}`;
};

/**
 * Format the full amount for tooltip display
 */
const formatFullAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Component to display formatted currency with tooltip
 */
export function FormattedCurrency({
  amount,
  maxDigits = 9,
  className = "",
  showSymbol = true,
}: FormattedCurrencyProps) {
  const displayValue = formatDisplayAmount(amount, maxDigits);
  const fullValue = formatFullAmount(amount);
  const displayText = showSymbol ? `₦${displayValue}` : displayValue;

  // Check if truncation occurred
  const isTruncated = displayValue.endsWith("...");

  // If not truncated, just show the text without tooltip
  if (!isTruncated) {
    return <span className={className}>{displayText}</span>;
  }

  // If truncated, show with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>{displayText}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{fullValue}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Utility function to format currency for display (without component)
 * Use this when you need just the formatted string
 */
export const formatCurrencyWithCommas = (
  amount: number,
  maxDigits: number = 9,
  showSymbol: boolean = true,
): string => {
  const displayValue = formatDisplayAmount(amount, maxDigits);
  return showSymbol ? `₦${displayValue}` : displayValue;
};

/**
 * Utility function to get full formatted currency
 */
export const getFullCurrencyValue = (amount: number): string => {
  return formatFullAmount(amount);
};
