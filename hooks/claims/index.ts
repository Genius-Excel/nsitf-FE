// Claims Module Hooks
// Barrel export for clean imports

export { useClaimsDashboard } from "./Useclaimsdashboard";
export { useManageClaims } from "./Usemanageclaims";
export { useClaimsFilters } from "./Useclaimsfilters";
export { useClaimDetail } from "./Useclaimdetail";
export { useClaimsUpload } from "./Useclaimsupload";
export { useClaimsCharts } from "./Useclaimscharts";
export { useBulkClaimActions } from "./UsebulkClaimActions";
export { useClaimsMetrics } from "./Useclaimsmetrics";

// Export types
export type {
  ClaimRecord,
  ClaimsDashboardResponse,
  ClaimDetailResponse,
  ClaimsUploadResponse,
  Claim,
  ClaimDetail,
  DashboardMetrics,
  ClaimCategories,
  ChartData,
  PaginationState,
  PaginationControls,
} from "@/lib/types/claims";
