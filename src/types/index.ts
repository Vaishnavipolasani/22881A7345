export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string;
  clicks: ClickData[];
  isExpired: boolean;
}

export interface ClickData {
  id: string;
  timestamp: string;
  source: string;
  location: string;
  userAgent: string;
}

export interface UrlFormData {
  originalUrl: string;
  validityMinutes?: number;
  customShortcode?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}