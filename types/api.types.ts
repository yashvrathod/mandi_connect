// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==================== User Types ====================

export interface FarmerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuyerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Auth Types ====================

export interface LoginResponse {
  token: string;
  user: FarmerProfile | BuyerProfile;
  role: 'farmer' | 'buyer';
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// ==================== Market & Crop Types ====================

export interface Market {
  _id: string;
  marketName: string;
  location?: string;
  city?: string;
  state?: string;
  createdAt?: string;
}

export interface Crop {
  _id: string;
  cropName: string;
  category?: string;
  unit?: string;
  createdAt?: string;
}

// ==================== Price Entry Types ====================

export interface PriceEntry {
  _id: string;
  farmerId: string;
  cropId: string | Crop;
  marketId: string | Market;
  price: number;
  unit?: string;
  quantity?: number;
  quality?: string;
  date?: string;
  agreeCount?: number;
  disagreeCount?: number;
  voters?: {
    agree: string[];
    disagree: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Marketplace Types ====================

export interface FarmerListing {
  _id: string;
  farmerId: string;
  farmer?: FarmerProfile;
  cropId: string;
  crop?: Crop;
  marketId: string;
  market?: Market;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  quality?: string;
  description?: string;
  images?: string[];
  status: 'available' | 'sold' | 'reserved';
  createdAt?: string;
  updatedAt?: string;
}

export interface BuyerDemand {
  _id: string;
  buyerId: string;
  buyer?: BuyerProfile;
  cropId: string;
  crop?: Crop;
  marketId?: string;
  market?: Market;
  quantity: number;
  unit: string;
  expectedPrice?: number;
  description?: string;
  Status: 'active' | 'fulfilled' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Notification Types ====================

export interface Notification {
  _id: string;
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'price_update' | 'marketplace_update' | 'general';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
  updatedAt?: string;
}

// ==================== Connection Types ====================

export interface ConnectionRequest {
  _id: string;
  senderId: string;
  sender?: FarmerProfile | BuyerProfile;
  senderRole: 'farmer' | 'buyer';
  recipientId: string;
  recipient?: FarmerProfile | BuyerProfile;
  recipientRole: 'farmer' | 'buyer';
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  relatedTo?: {
    type: 'listing' | 'demand';
    id: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Connection {
  _id: string;
  user1Id: string;
  user1?: FarmerProfile | BuyerProfile;
  user1Role: 'farmer' | 'buyer';
  user2Id: string;
  user2?: FarmerProfile | BuyerProfile;
  user2Role: 'farmer' | 'buyer';
  connectedAt: string;
}

// ==================== Stats Types ====================

export interface PriceStats {
  _id: string;
  cropId: string;
  crop?: Crop;
  marketId: string;
  market?: Market;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalEntries: number;
  lastUpdated: string;
}

// ==================== Request Types ====================

export interface AddPriceEntryRequest {
  cropId: string;
  marketId: string;
  price: number;
  quantity?: number;
  unit?: string;
  quality?: string;
}

export interface CreateListingRequest {
  cropId: string;
  marketId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  quality?: string;
  description?: string;
  images?: string[];
}

export interface AddDemandRequest {
  cropId: string;
  marketId?: string;
  quantity: number;
  unit: string;
  expectedPrice?: number;
  description?: string;
}

export interface SendConnectionRequest {
  recipientId: string;
  recipientRole: 'farmer' | 'buyer';
  message?: string;
  relatedTo?: {
    type: 'listing' | 'demand';
    id: string;
  };
}

// ==================== Utility Types ====================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
