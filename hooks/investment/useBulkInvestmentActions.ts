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

      // Check if there are any errors
      if (response.data.errors.length > 0) {
        // Show errors
        response.data.errors.forEach((err) => {
          toast.error(`Record ${err.id}: ${err.error}`);
        });

        // Also show success for updated records if any
        if (response.data.updated.length > 0) {
          toast.success(
            `${response.data.updated.length} record${
              response.data.updated.length > 1 ? "s" : ""
            } marked as reviewed`
          );
        }

        return response.data.updated.length > 0;
      }

      // All successful
      if (response.data.updated.length > 0) {
        toast.success(
          `${response.data.updated.length} record${
            response.data.updated.length > 1 ? "s" : ""
          } marked as reviewed`
        );
        return true;
      }

      toast.error("No records were updated");
      return false;
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

      // Check if there are any errors
      if (response.data.errors.length > 0) {
        // Show errors
        response.data.errors.forEach((err) => {
          toast.error(`Record ${err.id}: ${err.error}`);
        });

        // Also show success for updated records if any
        if (response.data.updated.length > 0) {
          toast.success(
            `${response.data.updated.length} record${
              response.data.updated.length > 1 ? "s" : ""
            } approved successfully`
          );
        }

        return response.data.updated.length > 0;
      }

      // All successful
      if (response.data.updated.length > 0) {
        toast.success(
          `${response.data.updated.length} record${
            response.data.updated.length > 1 ? "s" : ""
          } approved successfully`
        );
        return true;
      }

      toast.error("No records were updated");
      return false;
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
