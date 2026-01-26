// 验证相关类型

export interface CheckResponse {
  available: boolean;
  message: string;
}

export interface PasswordStrengthResult {
  isValid: boolean;
  message: string;
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    length: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasDigit: boolean;
    hasSpecial: boolean;
    minTypes: boolean;
  };
}
