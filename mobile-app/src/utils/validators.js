// Validators - Form validation utilities
import { APP_CONFIG } from './constants';

export const validateBranchId = (branchId) => {
  if (!branchId || branchId.trim() === '') {
    return { valid: false, error: 'Branch ID không được để trống' };
  }
  
  if (!APP_CONFIG.BRANCH_ID_PATTERN.test(branchId)) {
    return { valid: false, error: 'Branch ID phải có định dạng BRANCH_XXX (ví dụ: BRANCH_001)' };
  }
  
  return { valid: true };
};

export const validateCustomerName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Tên khách hàng không được để trống' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Tên khách hàng phải có ít nhất 2 ký tự' };
  }
  
  return { valid: true };
};

export const validateOrderDetails = (details) => {
  if (!details || details.trim() === '') {
    return { valid: false, error: 'Chi tiết đơn hàng không được để trống' };
  }
  
  if (details.trim().length < 3) {
    return { valid: false, error: 'Chi tiết đơn hàng phải có ít nhất 3 ký tự' };
  }
  
  return { valid: true };
};

export const validateServerHost = (host) => {
  if (!host || host.trim() === '') {
    return { valid: false, error: 'Server host không được để trống' };
  }
  
  return { valid: true };
};

export const validateServerPort = (port) => {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Server port phải là số từ 1 đến 65535' };
  }
  
  return { valid: true };
};

