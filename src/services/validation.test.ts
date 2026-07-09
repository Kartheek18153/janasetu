import { describe, it, expect, vi } from 'vitest';
import { 
  registerSchema, 
  loginSchema, 
  createGrievanceSchema, 
  updateGrievanceSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  createAnnouncementSchema,
  createOfficerSchema,
  feedbackSchema,
  validate,
} from '../services/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '9876543210',
      };
      const result = validate(registerSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.name).toBe('Test User');
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };
      const result = validate(registerSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };
      const result = validate(registerSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'A',
      };
      const result = validate(registerSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
      };
      const result = validate(registerSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = validate(loginSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };
      const result = validate(loginSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };
      const result = validate(loginSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createGrievanceSchema', () => {
    const validGrievance = {
      title: 'Test Grievance Title',
      description: 'This is a detailed description of the grievance issue.',
      category: 'water_supply',
      priority: 'high',
      department: 'Water Supply & Sanitation',
      location: {
        address: '123 Main Street',
        landmark: 'Near Park',
        city: 'Mumbai',
        wardNo: 'Ward 1',
        district: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
    };

    it('should validate valid grievance data', () => {
      const result = validate(createGrievanceSchema, validGrievance);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const invalidData = { ...validGrievance, title: 'Shrt' };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short description', () => {
      const invalidData = { ...validGrievance, description: 'Short dsc' };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidData = { ...validGrievance, category: 'invalid_category' };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidData = { ...validGrievance, priority: 'invalid_priority' };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing department', () => {
      const invalidData = { ...validGrievance, department: '' };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid location pincode', () => {
      const invalidData = { 
        ...validGrievance, 
        location: { ...validGrievance.location, pincode: '12345' } 
      };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid location city', () => {
      const invalidData = { 
        ...validGrievance, 
        location: { ...validGrievance.location, city: 'A' } 
      };
      const result = validate(createGrievanceSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateGrievanceSchema', () => {
    it('should validate partial update', () => {
      const result = validate(updateGrievanceSchema, { status: 'resolved' });
      expect(result.success).toBe(true);
    });

    it('should reject empty update', () => {
      const result = validate(updateGrievanceSchema, {});
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const result = validate(updateGrievanceSchema, { status: 'invalid_status' });
      expect(result.success).toBe(false);
    });
  });

  describe('createAppointmentSchema', () => {
    const validAppointment = {
      officerId: 'officer1',
      officerName: 'Officer Name',
      officerDesignation: 'Designation',
      department: 'Department',
      purpose: 'Test appointment purpose',
      preferredDate: new Date('2024-12-31'),
      preferredTimeSlot: '10:00-11:00',
    };

    it('should validate valid appointment data', () => {
      const result = validate(createAppointmentSchema, validAppointment);
      expect(result.success).toBe(true);
    });

    it('should reject short purpose', () => {
      const invalidData = { ...validAppointment, purpose: 'Short' };
      const result = validate(createAppointmentSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time slot', () => {
      const invalidData = { ...validAppointment, preferredTimeSlot: 'invalid' };
      const result = validate(createAppointmentSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('feedbackSchema', () => {
    it('should validate valid feedback', () => {
      const result = validate(feedbackSchema, { rating: 5, comment: 'Great!' });
      expect(result.success).toBe(true);
    });

    it('should reject rating out of range', () => {
      const result = validate(feedbackSchema, { rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject rating below 1', () => {
      const result = validate(feedbackSchema, { rating: 0 });
      expect(result.success).toBe(false);
    });
  });
});