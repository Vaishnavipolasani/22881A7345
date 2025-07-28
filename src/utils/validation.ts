import { logger } from './logger';
import { UrlFormData, ValidationError } from '../types';

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateShortcode = (shortcode: string): boolean => {
  // Alphanumeric, 3-20 characters
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(shortcode);
};

export const validateValidityMinutes = (minutes: string | number): boolean => {
  const num = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  return !isNaN(num) && num > 0 && num <= 525600; // Max 1 year
};

export const validateUrlFormData = (data: UrlFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  logger.debug('Validating URL form data', data, 'validation');

  // Validate original URL
  if (!data.originalUrl.trim()) {
    errors.push({ field: 'originalUrl', message: 'URL is required' });
  } else if (!validateUrl(data.originalUrl.trim())) {
    errors.push({ field: 'originalUrl', message: 'Please enter a valid HTTP/HTTPS URL' });
  }

  // Validate validity minutes if provided
  if (data.validityMinutes !== undefined) {
    if (!validateValidityMinutes(data.validityMinutes)) {
      errors.push({ field: 'validityMinutes', message: 'Validity must be a positive number (max 525600 minutes)' });
    }
  }

  // Validate custom shortcode if provided
  if (data.customShortcode && data.customShortcode.trim()) {
    if (!validateShortcode(data.customShortcode.trim())) {
      errors.push({ field: 'customShortcode', message: 'Shortcode must be 3-20 alphanumeric characters' });
    }
  }

  if (errors.length > 0) {
    logger.warn('Validation failed', { errors, data }, 'validation');
  } else {
    logger.info('Validation passed', data, 'validation');
  }

  return errors;
};