import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import logger from "../utils/logger";
import type * as Types from "../types/api.types";

// Base URL for API
export const BASE_URL = "https://mandiconnect.onrender.com";

// Create axios instance with enhanced configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API requests in development
    logger.apiRequest(config.url || '', config.method?.toUpperCase() || 'GET', config.data);
    
    return config;
  },
  (error) => {
    logger.apiError('Request interceptor', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    logger.apiResponse(response.config.url || '', response.status, response.data);
    return response;
  },
  async (error: AxiosError) => {
    // Log errors
    logger.apiError(error.config?.url || 'Unknown endpoint', error);
    
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.multiRemove(["token", "userRole", "userId", "user"]);
      // You might want to navigate to login here or emit an event
    }
    return Promise.reject(error);
  }
);

// Helper function to get headers with token
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ==================== AUTHENTICATION APIs ====================

export const authAPI = {
  // Farmer Authentication
  farmerSignup: (data: Types.SignupRequest) => 
    apiClient.post<Types.ApiResponse<Types.LoginResponse>>("/farmer/signup", data),
  farmerLogin: (data: { email: string; password: string }) => 
    apiClient.post<Types.ApiResponse<Types.LoginResponse>>("/farmer/login", data),
  farmerVerify: (token: string) => 
    apiClient.get<Types.ApiResponse>(`/farmer/verify?token=${token}`),
  getAllFarmers: () => 
    apiClient.get<Types.ApiResponse<Types.FarmerProfile[]>>("/farmer/getFarmers"),
  getFarmerById: (farmerId: string) => 
    apiClient.get<Types.ApiResponse<Types.FarmerProfile>>(`/farmer/${farmerId}`),
  farmerUpdate: (farmerId: string, data: Partial<Types.FarmerProfile>) => 
    apiClient.patch<Types.ApiResponse<Types.FarmerProfile>>(`/farmer/update/${farmerId}`, data),
  farmerDelete: (farmerId: string) => 
    apiClient.delete<Types.ApiResponse>(`/farmer/delete/${farmerId}`),
  farmerForgotPassword: (data: { email: string }) => 
    apiClient.post<Types.ApiResponse>("/farmer/forgot-password", data),
  farmerResetPassword: (token: string, data: { password: string }) => 
    apiClient.post<Types.ApiResponse>(`/farmer/reset-password?token=${token}`, data),

  // Buyer Authentication
  buyerSignup: (data: Types.SignupRequest) => 
    apiClient.post<Types.ApiResponse<Types.LoginResponse>>("/buyer/signup", data),
  buyerLogin: (data: { email: string; password: string }) => 
    apiClient.post<Types.ApiResponse<Types.LoginResponse>>("/buyer/login", data),
  buyerVerify: (token: string) => 
    apiClient.get<Types.ApiResponse>(`/buyer/verify?token=${token}`),
  getAllBuyers: () => 
    apiClient.get<Types.ApiResponse<Types.BuyerProfile[]>>("/buyer/getAll"),
  getBuyerById: (buyerId: string) => 
    apiClient.get<Types.ApiResponse<Types.BuyerProfile>>(`/buyer/${buyerId}`),
  buyerUpdate: (buyerId: string, data: Partial<Types.BuyerProfile>) => 
    apiClient.patch<Types.ApiResponse<Types.BuyerProfile>>(`/buyer/update/${buyerId}`, data),
  buyerDelete: (buyerId: string) => 
    apiClient.delete<Types.ApiResponse>(`/buyer/delete/${buyerId}`),
  buyerForgotPassword: (data: { email: string }) => 
    apiClient.post<Types.ApiResponse>("/buyer/forgot-password", data),
  buyerResetPassword: (token: string, data: { password: string }) => 
    apiClient.post<Types.ApiResponse>(`/buyer/reset-password?token=${token}`, data),
};

// ==================== COMMON APIs ====================

export const commonAPI = {
  // Markets
  addMarket: (data: { marketName: string; location?: string; city?: string; state?: string }) => 
    apiClient.post<Types.ApiResponse<Types.Market>>("/addMarket", data),
  getAllMarkets: () => 
    apiClient.get<Types.ApiResponse<Types.Market[]>>("/getAllMarket"),

  // Crops
  addCrop: (data: { cropName: string; category?: string; unit?: string }) => 
    apiClient.post<Types.ApiResponse<Types.Crop>>("/addCrop", data),
  getAllCrops: () => 
    apiClient.get<Types.ApiResponse<Types.Crop[]>>("/getAllCrop"),
};

// ==================== FARMER PRICE FEATURES ====================

export const priceAPI = {
  // Price Entries
  addPriceEntry: (data: Types.AddPriceEntryRequest) => 
    apiClient.post<Types.ApiResponse<Types.PriceEntry>>("/farmer-entries/add", data),
  getAllPriceEntries: () => 
    apiClient.get<Types.ApiResponse<Types.PriceEntry[]>>("/farmer-entries/getAllEntries"),
  getPriceByIds: (cropId: string, marketId: string) =>
    apiClient.get<Types.ApiResponse<Types.PriceEntry[]>>(`/farmer-entries/getByCropAndMarket/${cropId}/${marketId}`),
  getPriceByFarmerId: (farmerId: string) =>
    apiClient.get<Types.ApiResponse<Types.PriceEntry[]>>(`/farmer-entries/getByFarmerId/${farmerId}`),

  // Price Voting
  priceAgree: (entryId: string, farmerId: string) => 
    apiClient.post<Types.ApiResponse>(`/farmer-entries/agree/${entryId}/${farmerId}`),
  priceDisagree: (entryId: string, farmerId: string) => 
    apiClient.post<Types.ApiResponse>(`/farmer-entries/disagree/${entryId}/${farmerId}`),
  getAgreeCount: (entryId: string) => 
    apiClient.get<Types.ApiResponse<{ count: number }>>(`/farmer-entries/agree-count/${entryId}`),
  getDisagreeCount: (entryId: string) => 
    apiClient.get<Types.ApiResponse<{ count: number }>>(`/farmer-entries/disagree-count/${entryId}`),
};

// ==================== PRICE MARKET STATS ====================

export const statsAPI = {
  getByCropIdAndMarketId: (cropId: string, marketId: string) =>
    apiClient.get<Types.ApiResponse<Types.PriceStats>>(`/stats/getByCropIdAndMarketid/${cropId}/${marketId}`),
  getStatsByMarket: (marketId: string) => 
    apiClient.get<Types.ApiResponse<Types.PriceStats[]>>(`/stats/getByMarket/${marketId}`),
  getStatsByCrop: (cropId: string) => 
    apiClient.get<Types.ApiResponse<Types.PriceStats[]>>(`/stats/getByCrop/${cropId}`),
};

// ==================== MARKETPLACE – FARMER SIDE ====================

export const farmerMarketplaceAPI = {
  // File Upload
  uploadImage: (formData: FormData) =>
    apiClient.post<Types.ApiResponse<{ url: string; publicId: string }>>("/marketplace/farmer/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteImage: (publicId: string) => 
    apiClient.delete<Types.ApiResponse>(`/marketplace/farmer/delete?public_id=${publicId}`),

  // Crop Listings
  createListing: (data: Types.CreateListingRequest) => 
    apiClient.post<Types.ApiResponse<Types.FarmerListing>>("/marketplace/farmer/cropListing", data),
  getAllListings: () => 
    apiClient.get<Types.ApiResponse<Types.FarmerListing[]>>("/marketplace/farmer/getAllListing"),
  getListingById: (listingId: string) =>
    apiClient.get<Types.ApiResponse<Types.FarmerListing>>(`/marketplace/farmer/listing/${listingId}`),
  updateListing: (listingId: string, data: Partial<Types.FarmerListing>) =>
    apiClient.patch<Types.ApiResponse<Types.FarmerListing>>(`/marketplace/farmer/listing/${listingId}`, data),
  deleteListing: (listingId: string) =>
    apiClient.delete<Types.ApiResponse>(`/marketplace/farmer/listing/${listingId}`),
};

// ==================== MARKETPLACE – BUYER SIDE ====================

export const buyerMarketplaceAPI = {
  // Demands
  addDemand: (data: Types.AddDemandRequest) => 
    apiClient.post<Types.ApiResponse<Types.BuyerDemand>>("/marketplace/buyer/add", data),
  getAllDemands: () => 
    apiClient.get<Types.ApiResponse<Types.BuyerDemand[]>>("/marketplace/buyer/all"),
  getDemandsByBuyer: (buyerId: string) =>
    apiClient.get<Types.ApiResponse<Types.BuyerDemand[]>>(`/marketplace/buyer/buyer/${buyerId}`),
  getDemandsByStatus: (status: string) => 
    apiClient.get<Types.ApiResponse<Types.BuyerDemand[]>>(`/marketplace/buyer/status/${status}`),
  updateDemandStatus: (demandId: string, data: { Status: string }) =>
    apiClient.patch<Types.ApiResponse<Types.BuyerDemand>>(`/marketplace/buyer/updateStatus/${demandId}`, data),
  deleteDemand: (demandId: string) => 
    apiClient.delete<Types.ApiResponse>(`/marketplace/buyer/delete/${demandId}`),
};

// ==================== NOTIFICATIONS ====================

export const notificationAPI = {
  getNotificationsByUserId: (userId: string) =>
    apiClient.get<Types.ApiResponse<Types.Notification[]>>(`/notifications/user/${userId}`),
  markAsRead: (notificationId: string) =>
    apiClient.patch<Types.ApiResponse>(`/notifications/read/${notificationId}`),
  markAllAsRead: (userId: string) =>
    apiClient.patch<Types.ApiResponse>(`/notifications/read-all/${userId}`),
  deleteNotification: (notificationId: string) =>
    apiClient.delete<Types.ApiResponse>(`/notifications/${notificationId}`),
};

// ==================== CONNECTION REQUEST SYSTEM ====================

export const connectionAPI = {
  // Get incoming connection requests for a specific user
  getIncomingRequests: (userId: string) => 
    apiClient.get<Types.ApiResponse<Types.ConnectionRequest[]>>(`/connections/incoming/${userId}`),
  // Get outgoing/sent connection requests for a specific user
  getSentRequests: (userId: string) => 
    apiClient.get<Types.ApiResponse<Types.ConnectionRequest[]>>(`/connections/sent/${userId}`),
  // Send a new connection request
  sendRequest: (data: Types.SendConnectionRequest) => 
    apiClient.post<Types.ApiResponse<Types.ConnectionRequest>>("/connections/send", data),
  // Accept a connection request
  acceptRequest: (requestId: string) => 
    apiClient.patch<Types.ApiResponse<Types.Connection>>(`/connections/accept/${requestId}`),
  // Reject a connection request
  rejectRequest: (requestId: string) => 
    apiClient.patch<Types.ApiResponse>(`/connections/reject/${requestId}`),
  // Get all established connections for a user
  getConnections: (userId: string) =>
    apiClient.get<Types.ApiResponse<Types.Connection[]>>(`/connections/user/${userId}`),
  // Remove/delete a connection
  removeConnection: (connectionId: string) =>
    apiClient.delete<Types.ApiResponse>(`/connections/${connectionId}`),
};

// Export the main client for custom requests
export default apiClient;
