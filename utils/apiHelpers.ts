// ==================== API Helper Functions ====================

import type { FarmerListing, BuyerDemand, ConnectionRequest } from '../types/api.types';

/**
 * Safely extract user ID from listing/demand objects with fallback checks
 */
export const extractUserId = (
  item: any,
  role: 'farmer' | 'buyer'
): string | null => {
  if (!item) return null;

  const possibleKeys = role === 'farmer' 
    ? ['farmerId', 'FarmerId', 'farmer_id', 'farmer', 'Farmer ID']
    : ['buyerId', 'BuyerId', 'buyer_id', 'buyer', 'Buyer ID'];

  // Check direct properties
  for (const key of possibleKeys) {
    if (item[key]) {
      // Handle if it's an object with _id
      if (typeof item[key] === 'object' && item[key]._id) {
        return item[key]._id;
      }
      // Handle if it's a string
      if (typeof item[key] === 'string') {
        return item[key];
      }
    }
  }

  // Check nested farmer/buyer object
  if (role === 'farmer' && item.farmer?._id) {
    return item.farmer._id;
  }
  if (role === 'buyer' && item.buyer?._id) {
    return item.buyer._id;
  }

  return null;
};

/**
 * Safely extract crop information
 */
export const extractCropInfo = (item: any): { id: string; name: string } | null => {
  if (!item) return null;

  // If cropId is an object (populated)
  if (typeof item.cropId === 'object' && item.cropId?._id) {
    return {
      id: item.cropId._id,
      name: item.cropId.cropName || item.cropId.name || 'Unknown Crop',
    };
  }

  // If crop is separate field
  if (item.crop?._id) {
    return {
      id: item.crop._id,
      name: item.crop.cropName || item.crop.name || 'Unknown Crop',
    };
  }

  // If cropId is just a string
  if (typeof item.cropId === 'string') {
    return {
      id: item.cropId,
      name: item.cropName || 'Unknown Crop',
    };
  }

  return null;
};

/**
 * Safely extract market information
 */
export const extractMarketInfo = (item: any): { id: string; name: string } | null => {
  if (!item) return null;

  // If marketId is an object (populated)
  if (typeof item.marketId === 'object' && item.marketId?._id) {
    return {
      id: item.marketId._id,
      name: item.marketId.marketName || item.marketId.name || 'Unknown Market',
    };
  }

  // If market is separate field
  if (item.market?._id) {
    return {
      id: item.market._id,
      name: item.market.marketName || item.market.name || 'Unknown Market',
    };
  }

  // If marketId is just a string
  if (typeof item.marketId === 'string') {
    return {
      id: item.marketId,
      name: item.marketName || 'Unknown Market',
    };
  }

  return null;
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number, currency = '₹'): string => {
  return `${currency}${price.toLocaleString('en-IN')}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Check if listing/demand has required user ID
 */
export const hasRequiredUserId = (
  item: FarmerListing | BuyerDemand,
  role: 'farmer' | 'buyer'
): boolean => {
  return extractUserId(item, role) !== null;
};

/**
 * Normalize API response data
 */
export const normalizeResponse = <T>(response: any): T => {
  // Handle nested data structure
  if (response?.data?.data) {
    return response.data.data;
  }
  if (response?.data) {
    return response.data;
  }
  return response;
};

/**
 * Build connection request payload with validation
 */
export const buildConnectionRequest = (
  recipientId: string,
  recipientRole: 'farmer' | 'buyer',
  relatedType?: 'listing' | 'demand',
  relatedId?: string,
  message?: string
) => {
  if (!recipientId) {
    throw new Error('Recipient ID is required');
  }

  return {
    recipientId,
    recipientRole,
    message: message || `Hi, I'd like to connect with you.`,
    ...(relatedType && relatedId && {
      relatedTo: {
        type: relatedType,
        id: relatedId,
      },
    }),
  };
};

/**
 * Check if connection already exists
 */
export const isAlreadyConnected = (
  connections: ConnectionRequest[],
  userId: string
): boolean => {
  return connections.some(
    (conn) =>
      (conn.senderId === userId || conn.recipientId === userId) &&
      conn.status === 'accepted'
  );
};

/**
 * Check if pending request exists
 */
export const hasPendingRequest = (
  requests: ConnectionRequest[],
  userId: string
): boolean => {
  return requests.some(
    (req) =>
      (req.senderId === userId || req.recipientId === userId) &&
      req.status === 'pending'
  );
};
