// 密码强度验证工具

import type { PasswordStrengthResult } from '../types/validation';

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    length: password.length >= 6 && password.length <= 20,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^*?\-+=~.,]/.test(password),
    minTypes: false,
  };

  // 计算满足的字符类型数量
  const typeCount = [
    requirements.hasLowercase,
    requirements.hasUppercase,
    requirements.hasDigit,
    requirements.hasSpecial,
  ].filter(Boolean).length;

  requirements.minTypes = typeCount >= 2;

  // 检查危险字符
  const dangerousChars = ['<', '>', '"', "'", '&', '|', ';', '$', '(', ')', '{', '}', '[', ']', '\\', '/', '`'];
  const hasDangerousChar = dangerousChars.some(char => password.includes(char));

  // 判断是否有效
  const isValid =
    requirements.length &&
    requirements.minTypes &&
    !hasDangerousChar;

  // 生成错误信息
  let message = '';
  if (!requirements.length) {
    message = '密码长度必须在6-20个字符之间';
  } else if (hasDangerousChar) {
    message = '密码包含不安全的特殊字符，请避免使用: < > " \' & | ; $ ( ) { } [ ] \\ / `';
  } else if (!requirements.minTypes) {
    message = '密码必须包含以下至少两类字符：数字、大写字母、小写字母、特殊符号';
  } else {
    message = '密码强度符合要求';
  }

  // 判断密码强度
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (isValid) {
    if (typeCount >= 3 && password.length >= 8) {
      strength = 'strong';
    } else if (typeCount >= 2 && password.length >= 6) {
      strength = 'medium';
    }
  }

  return {
    isValid,
    message,
    strength,
    requirements,
  };
}
