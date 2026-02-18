// ==================== Input Validation Utilities ====================

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  password: (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  },

  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  number: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  positiveNumber: (value: any): boolean => {
    return validators.number(value) && parseFloat(value) > 0;
  },

  pincode: (pincode: string): boolean => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  },
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, Array<{ validator: keyof typeof validators | ((value: any) => boolean | { isValid: boolean; message?: string }); message?: string }>>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const validator = typeof rule.validator === 'function' 
        ? rule.validator 
        : validators[rule.validator];

      const result = validator(data[field]);
      const isValid = typeof result === 'boolean' ? result : result.isValid;

      if (!isValid) {
        errors[field] = typeof result === 'object' && result.message 
          ? result.message 
          : rule.message || `${field} is invalid`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
