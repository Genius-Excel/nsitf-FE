import { get } from "http";

export const routes = {
  createAdmin: () => "/api/register-user/admin",
  login: () => "/api/auth/login",
  signup: (userType) => `/api/register-user/${userType}`,
  logout: () => "/api/auth/logout",
  resendConfirmation: () => "/api/auth/resend-confirmation-email",
  updateUserProfileDetails: () => "/api/user-profile/update",
  getUserProfileDetails: () => "/api/user-profile",
  confirmEmail: () => "/api/auth/confirm-email",
  resetPasswordEmailRequest: () => "/api/auth/password-reset-email",
  resetPassword: () => "",
  changePassword: () => "/api/auth/change-password",
  userProfile: () => `/api/user-profile`,
  editUserProfile: () => `/api/user-profile/update`,

  verifyEmailToken: (token) => `/api/auth/confirm-email?token=${token}`,
  adminAddUsers: () => "/api/admin/users",
  adminGetUsers: () => "/api/admin/users",
  editUser: (userId) => `/api/admin/users/${userId}`,
  deleteUser: (userId) => `/api/admin/users/${userId}`,
  getUserPermissions: (userId) => `/api/admin/users/${userId}/permissions`,
  assignUserPermissions: () => "/api/admin/users/permissions",
  removeUserPermissions: () => "/api/admin/users/permissions",
  getAllPermissions: () => "/api/admin/permissions",

  getComplianceDashboard: () => "/api/dashboard/compliance",

  createHSE: () => "/api/hse-ops/hse-records",
  getHseRecords: () => "/api/hse-ops/hse-records",
  getSingleHseRecord: (recordId) => `/api/hse-ops/hse-records/${recordId}`,
  editHseRecord: (recordId) => `/api/hse-ops/hse-records/${recordId}`,
  deleteHseRecord: (recordId) => `/api/hse-ops/hse-records/${recordId}`,
  updateManageHseRecord: (uuid) => `/api/hse-ops/manage-hse/${uuid}`,
  getSingleManageHseRecord: (uuid) => `/api/hse-ops/manage-hse/${uuid}`,
  getHSEDashboardMetrics: () => "/api/hse-ops/hse-dashboard-metrics",
  getHSEDashboardTable: () => "/api/hse-ops/dashboard?view=table",
  getHSEDashboardActivities: () => "/api/hse-ops/dashboard?view=activities",
  getHSEBranchDetails: (branchId) =>
    `/api/hse-ops/dashboard/${branchId}/detail`,

  createInspection: () => "/api/inspection-ops/inspections",
  getInspections: () => "/api/inspection-ops/inspections",
  getSingleInspection: (inspectionId) =>
    `/api/inspection-ops/inspections/${inspectionId}`,
  editInspection: (inspectionId) =>
    `/api/inspection-ops/inspections/${inspectionId}`,
  deleteInspection: (inspectionId) =>
    `/api/inspection-ops/inspections/${inspectionId}`,
  getInspectionDashboardMetrics: () =>
    "/api/inspection-ops/inspections/dashboard",

  getKPIAnalysis: () => "/api/kpi/analysis",
};
