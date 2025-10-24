import { get } from "http";

export const routes = {
  createAdmin:()=> "/api/register-user/admin",
  login: () => "/api/auth/login",
  signup:(userType)=>`/api/register-user/${userType}`,
  logout:()=> "/api/auth/logout",
  resendConfirmation:()=> "/api/auth/resend-confirmation-email",
  updateUserProfileDetails:()=> "/api/user-profile/update",
  getUserProfileDetails:()=> "/api/user-profile",
  confirmEmail:()=> "/api/auth/confirm-email",
  resetPasswordEmailRequest:()=> "/api/auth/password-reset-email",
  resetPassword:()=> "",
  changePassword:()=> "/api/auth/change-password",
  userProfile:()=> `/api/user-profile`,

  verifyEmailToken:(token)=> `/api/auth/confirm-email?token=${token}`,
  adminAddUsers:()=> "/api/admin/users",
  adminGetUsers:()=> "/api/admin/users",
  editUser:(userId)=> `/api/admin/users/${userId}`,
  deleteUser:(userId)=> `/api/admin/users/${userId}`,
  
  
  // Inventory
  createRestaurantStore:(restaurantId) => `/api/inventory/create-store/${restaurantId}`,
  getRestaurantStore:(restaurantId) => `/api/inventory/get-stores/${restaurantId}`,
  getRestaurantStoreItems:(restaurantId, storeId) => `/api/inventory/get-store-items/${restaurantId}/${storeId}`,
  createRestaurantStockItem:(restaurantId, storeId) => `/api/inventory/stock-item/${restaurantId}/${storeId}`,
  updateRestaurantStockItem:(restaurantId, storeId, stockItemId) => `/api/inventory/update-stock-item/${restaurantId}/${storeId}/${stockItemId}`,
  deleteRestaurantStockItem:(restaurantId, storeId, stockItemId) => `/api/inventory/update-stock-item/${restaurantId}/${storeId}/${stockItemId}`,
  getRestaurantStockItem:(restaurantId, storeId, stockItemId) => `/api/inventory/stock-item/${restaurantId}/${storeId}`,
  updateRestaurantStore:(restaurantId, storeId) => `/api/inventory/update-store/${restaurantId}/${storeId}`,
  deleteRestaurantStore:(restaurantId, storeId) => `/api/inventory/delete-store/${restaurantId}/${storeId}`,
  addRestaurantStoreItem:(restaurantId, storeId) => `/api/inventory/add-store-item/${restaurantId}/${storeId}`,
  getResturantStoreStockItem: (restaurantId, storeId, stockItemId) => `api/inventory/stock-item/${restaurantId}/${storeId}/${stockItemId}`,

  // cutomlink
  createAndUpdateCustomLink:(businessId) => `/api/update-custom-link/${businessId}`,
};
