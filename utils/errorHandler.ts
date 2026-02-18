// ==================== Centralized Error Handling ====================

import { Alert } from 'react-native';
import logger from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any, context?: string): string => {
  logger.error(`Error in ${context || 'API call'}`, error);

  // Network error
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }

  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }

  // API error response
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return message || 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return message || 'Resource not found.';
      case 409:
        return message || 'Conflict. Resource already exists.';
      case 422:
        return message || 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return message || 'Something went wrong. Please try again.';
    }
  }

  // Generic error
  return error.message || 'An unexpected error occurred.';
};

export const showErrorAlert = (error: any, context?: string) => {
  const message = handleApiError(error, context);
  Alert.alert('Error', message);
};

export const showSuccessAlert = (message: string, title = 'Success') => {
  Alert.alert(title, message);
};
