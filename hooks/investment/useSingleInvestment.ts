// ============================================================================
// useSingleInvestment Hook
// ============================================================================
// Fetches detailed information for a single investment record
// ============================================================================

import { useState, useEffect } from "react";
import { getInvestmentRecord } from "@/services/investment";
import type { InvestmentRecord } from "@/lib/types/investment";

interface UseSingleInvestmentReturn {
  investment: InvestmentRecord | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSingleInvestment(
  investmentId: string | null
): UseSingleInvestmentReturn {
  const [investment, setInvestment] = useState<InvestmentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvestment = async () => {
    if (!investmentId) {
      setInvestment(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getInvestmentRecord(investmentId);
      setInvestment(data);
    } catch (err) {
      console.error("Error fetching investment:", err);
      setError(err as Error);
      setInvestment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestment();
  }, [investmentId]);

  return {
    investment,
    loading,
    error,
    refetch: fetchInvestment,
  };
}
