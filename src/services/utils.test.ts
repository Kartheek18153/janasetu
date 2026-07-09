import { describe, it, expect, vi } from 'vitest';
import { generateTrackingId, generateRegistrationId, formatDate, formatDateTime, formatRelativeTime } from '../services/utils';

describe('Utility Functions', () => {
  describe('generateTrackingId', () => {
    it('should generate a tracking ID with correct format', () => {
      const id = generateTrackingId();
      expect(id).toMatch(/^JST-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTrackingId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateRegistrationId', () => {
    it('should generate a registration ID with correct format', () => {
      const id = generateRegistrationId();
      expect(id).toMatch(/^JSTREG-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateRegistrationId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/15 Jan 2024|15/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toMatch(/15 Jan 2024|15/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/15 Jan 2024/);
      expect(formatted).toMatch(/14:30|2:30/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for very recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });
  });
});