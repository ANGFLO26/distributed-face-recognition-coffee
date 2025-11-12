// Helpers - Utility functions
import { ERROR_MESSAGES } from './constants';

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

export const getErrorMessage = (error) => {
  if (error.error_code && ERROR_MESSAGES[error.error_code]) {
    return ERROR_MESSAGES[error.error_code];
  }
  
  if (error.code === 'ECONNREFUSED') {
    return ERROR_MESSAGES.CONNECTION_REFUSED;
  }
  
  if (error.message && error.message.includes('timeout')) {
    return ERROR_MESSAGES.CONNECTION_TIMEOUT;
  }
  
  if (error.error_message) {
    return error.error_message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES.PROCESSING_ERROR;
};

export const isOrderFromDifferentBranch = (orderBranchId, currentBranchId) => {
  return orderBranchId && orderBranchId !== currentBranchId;
};

