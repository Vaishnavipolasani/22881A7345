import { logger } from './logger';
import { ShortenedUrl, ClickData } from '../types';

class UrlService {
  private readonly STORAGE_KEY = 'shortened_urls';
  private readonly HOSTNAME = 'http://localhost:3000';

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private isShortCodeUnique(shortCode: string, existingUrls: ShortenedUrl[]): boolean {
    return !existingUrls.some(url => url.shortCode === shortCode);
  }

  private generateUniqueShortCode(existingUrls: ShortenedUrl[]): string {
    let shortCode: string;
    let attempts = 0;
    
    do {
      shortCode = this.generateShortCode();
      attempts++;
      
      if (attempts > 100) {
        logger.error('Failed to generate unique shortcode after 100 attempts', null, 'urlService');
        throw new Error('Failed to generate unique shortcode');
      }
    } while (!this.isShortCodeUnique(shortCode, existingUrls));

    return shortCode;
  }

  private getStoredUrls(): ShortenedUrl[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to retrieve stored URLs', error, 'urlService');
      return [];
    }
  }

  private saveUrls(urls: ShortenedUrl[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
      logger.debug('URLs saved to storage', { count: urls.length }, 'urlService');
    } catch (error) {
      logger.error('Failed to save URLs to storage', error, 'urlService');
      throw new Error('Failed to save URLs');
    }
  }

  private updateUrlExpiredStatus(url: ShortenedUrl): ShortenedUrl {
    const now = new Date();
    const expiresAt = new Date(url.expiresAt);
    
    return {
      ...url,
      isExpired: now > expiresAt
    };
  }

  private generateGeolocation(): string {
    // Mock geolocation for demonstration
    const locations = [
      'New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 
      'Toronto, CA', 'Berlin, DE', 'Mumbai, IN', 'São Paulo, BR'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private generateSource(): string {
    const sources = ['Direct', 'Email', 'Social Media', 'Search Engine', 'Referral'];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  shortenUrl(originalUrl: string, validityMinutes: number = 30, customShortcode?: string): ShortenedUrl {
    logger.info('Shortening URL', { originalUrl, validityMinutes, customShortcode }, 'urlService');

    const existingUrls = this.getStoredUrls();

    // Handle custom shortcode
    let shortCode: string;
    if (customShortcode) {
      if (!this.isShortCodeUnique(customShortcode, existingUrls)) {
        logger.warn('Custom shortcode already exists', { customShortcode }, 'urlService');
        throw new Error('Custom shortcode already exists. Please choose a different one.');
      }
      shortCode = customShortcode;
    } else {
      shortCode = this.generateUniqueShortCode(existingUrls);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000);

    const shortenedUrl: ShortenedUrl = {
      id: crypto.randomUUID(),
      originalUrl,
      shortCode,
      shortUrl: `${this.HOSTNAME}/r/${shortCode}`,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: [],
      isExpired: false
    };

    const updatedUrls = [...existingUrls, shortenedUrl];
    this.saveUrls(updatedUrls);

    logger.info('URL shortened successfully', { shortCode, shortUrl: shortenedUrl.shortUrl }, 'urlService');
    return shortenedUrl;
  }

  getAllUrls(): ShortenedUrl[] {
    const urls = this.getStoredUrls();
    return urls.map(url => this.updateUrlExpiredStatus(url));
  }

  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    const urls = this.getStoredUrls();
    const url = urls.find(u => u.shortCode === shortCode);
    return url ? this.updateUrlExpiredStatus(url) : null;
  }

  trackClick(shortCode: string): { originalUrl: string; success: boolean; error?: string } {
    logger.info('Tracking click', { shortCode }, 'urlService');

    const urls = this.getStoredUrls();
    const urlIndex = urls.findIndex(u => u.shortCode === shortCode);

    if (urlIndex === -1) {
      logger.warn('Short URL not found', { shortCode }, 'urlService');
      return { originalUrl: '', success: false, error: 'Short URL not found' };
    }

    const url = this.updateUrlExpiredStatus(urls[urlIndex]);

    if (url.isExpired) {
      logger.warn('Short URL expired', { shortCode, expiresAt: url.expiresAt }, 'urlService');
      return { originalUrl: '', success: false, error: 'Short URL has expired' };
    }

    // Add click data
    const clickData: ClickData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: this.generateSource(),
      location: this.generateGeolocation(),
      userAgent: navigator.userAgent
    };

    urls[urlIndex] = {
      ...url,
      clicks: [...url.clicks, clickData]
    };

    this.saveUrls(urls);

    logger.info('Click tracked successfully', { shortCode, clickCount: urls[urlIndex].clicks.length }, 'urlService');
    return { originalUrl: url.originalUrl, success: true };
  }

  deleteExpiredUrls(): number {
    const urls = this.getStoredUrls();
    const now = new Date();
    const activeUrls = urls.filter(url => new Date(url.expiresAt) > now);
    const deletedCount = urls.length - activeUrls.length;

    if (deletedCount > 0) {
      this.saveUrls(activeUrls);
      logger.info('Expired URLs cleaned up', { deletedCount }, 'urlService');
    }

    return deletedCount;
  }
}

export const urlService = new UrlService();