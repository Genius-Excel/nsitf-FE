import { get } from "http";

export const routes = {
  createAdmin:()=> "/api/register-user/admin",
  loginWithEmail: () => "/api/auth/login",
  loginWithPhonenumber:()=> "/api/authenticate/auth-api/mobile-phone-signin",
  restaurantVerifyMail:()=> "/api/authenticate/auth-api/verify-email",
  signup:(userType)=>`/api/register-user/${userType}`,
  logout:()=> "/api/auth/logout",
  resendEmail:()=> "/api/auth/resend-confirmation-email",
  googleAuth:()=>"",
  facebookAuth:()=>"",
  onboardingStepOne:(userId)=> `/api/business-details/${userId}`,
  onboardingStepTwo:(businessId)=> `/api/document-upload-status/${businessId}`,
  verifyEmailToken:(token)=> `/api/auth/confirm-email/${token}`,
  sendPasswordReset:()=> "/api/auth/password-reset-email",
  obtainToken:()=> "/api/token/refresh",
  passwordReset:(jwtToken) =>`/api/auth/reset-password/${jwtToken}`,
  getVerificationStatus:(businessId) => `/api/business-verification-status/${businessId}`,

  // profile
  getBusinessProfileInfo:(businessId) => `/api/business-profile-overview/${businessId}`,
  updateBusinessDetailsGeneral:(businessId) => `/api/update-business-details/${businessId}`,
  getUserProfileInfo:(userId) => `/api/user-profile-overview/${userId}`,
  addBankDetails:(userId) => `/api/create-bank-details/${userId}`,
  updateBankDetails:(userId,bank_id) => `/api/update-bank-details/${userId}/${bank_id}`,
  postBusinessHours:(businessId) => `/api/business-hours/${businessId}`,
  sendEmployeeInvitation:(userId, businessId) => `/api/invite-employee/${userId}/${businessId}`,
  updateUserProfile:(userId) => `/api/update-user-profile/${userId}`,
  checkPassword:(userId) => `/api/auth/check-password/${userId}`,

  // menu-drink-pastry items
  addRestaurantMenuItem:(businessId) => `/api/restaurant-menu-item/${businessId}`,
  addRestaurantDrinkItem:(businessId) =>  `/api/restaurant-drink-item/${businessId}`,
  addRestaurantPastryItem:(businessId) =>  `/api/restaurant-pastry-item/${businessId}`,
  UpdateRestaurantMenuItem:(businessId) => `/api/restaurant-menu-item/${businessId}`,
  getRestaurantMenuItem:(businessId) => `/api/restaurant-menu-item/${businessId}`,
  getRestaurantDrinkItem:(businessId) =>  `/api/restaurant-drink-item/${businessId}`,
  getRestaurantPastryItem:(businessId) =>  `/api/restaurant-pastry-item/${businessId}`,
  
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
