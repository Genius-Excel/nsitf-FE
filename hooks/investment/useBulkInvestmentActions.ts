// ============================================================================
// useBulkInvestmentActions Hook
// ============================================================================
// Handles bulk review and approval actions for investment records
// ============================================================================

import { useState } from "react";
import { toast } from "sonner";
import {
  bulkReviewInvestmentRecords,
  bulkApproveInvestmentRecords,
} from "@/services/investment";

interface UseBulkInvestmentActionsReturn {
  bulkReview: (recordIds: string[]) => Promise<boolean>;
  bulkApprove: (recordIds: string[]) => Promise<boolean>;
  loading: boolean;
}

export function useBulkInvestmentActions(): UseBulkInvestmentActionsReturn {
  const [loading, setLoading] = useState(false);

  const bulkReview = async (recordIds: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await bulkReviewInvestmentRecords({ recordIds });

      if (response.success) {
        toast.success(
          `${response.updatedCount} record${response.updatedCount > 1 ? "s" : ""} marked as reviewed`
        );
        return true;
      } else {
        toast.error("Failed to review records");
        return false;
      }
    } catch (error) {
      console.error("Error reviewing records:", error);
      toast.error("An error occurred while reviewing records");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkApprove = async (recordIds: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await bulkApproveInvestmentRecords({ recordIds });

      if (response.success) {
        toast.success(
          `${response.updatedCount} record${response.updatedCount > 1 ? "s" : ""} approved successfully`
        );
        return true;
      } else {
        toast.error("Failed to approve records");
        return false;
      }
    } catch (error) {
      console.error("Error approving records:", error);
      toast.error("An error occurred while approving records");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkReview,
    bulkApprove,
    loading,
  };
}
