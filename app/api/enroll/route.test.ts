import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencies
jest.mock('@/lib/database');
jest.mock('@/lib/security');

// Import mocked modules
import { enrollmentOperations } from '@/lib/dynamodb-data';
import { rateLimit, sanitizeInput, getSecurityHeaders } from '@/lib/security';

// Type the mocked modules
const mockEnrollmentOperations = enrollmentOperations as jest.Mocked<typeof enrollmentOperations>;
const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;
const mockSanitizeInput = sanitizeInput as jest.MockedFunction<typeof sanitizeInput>;
const mockGetSecurityHeaders = getSecurityHeaders as jest.MockedFunction<typeof getSecurityHeaders>;

describe('/api/enroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockRateLimit.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    });
    
    mockSanitizeInput.mockImplementation((input: string) => input?.trim() || input);
    
    mockGetSecurityHeaders.mockReturnValue({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });

    mockEnrollmentOperations.getByEmail.mockReturnValue([]);
    mockEnrollmentOperations.create.mockReturnValue({ id: 1 });
  });

  describe('POST /api/enroll', () => {
    test('should successfully create enrollment with valid data', async () => {
      const validEnrollmentData = {
        student_first_name: 'Emma',
        student_last_name: 'Wilson',
        student_date_of_birth: '2018-05-15',
        student_gender: 'female',
        program_type: 'girls_recreational',
        parent_first_name: 'Sarah',
        parent_last_name: 'Wilson',
        parent_email: 'sarah.wilson@example.com',
        parent_phone: '5551234567',
        address: '456 Maple St',
        city: 'Las Cruces',
        state: 'NM',
        zip_code: '88001',
        emergency_contact_name: 'John Wilson',
        emergency_contact_relationship: 'father',
        emergency_contact_phone: '5559876543',
        payment_method: 'monthly',
        terms_accepted: true,
        photo_permission: true,
        signature_name: 'Sarah Wilson',
        signature_date: '2025-01-02'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validEnrollmentData)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Enrollment application submitted successfully!');
      expect(responseData.enrollmentId).toBe(1);
      expect(mockEnrollmentOperations.create).toHaveBeenCalledWith(
        expect.objectContaining({
          student_first_name: 'Emma',
          student_last_name: 'Wilson',
          program_type: 'girls_recreational'
        })
      );
    });

    test('should reject enrollment with missing required fields', async () => {
      const invalidData = {
        student_first_name: '',
        program_type: 'girls_recreational'
        // Missing many required fields
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.details).toBeDefined();
      expect(Array.isArray(responseData.details)).toBe(true);
    });

    test('should reject enrollment with invalid program type', async () => {
      const invalidData = {
        student_first_name: 'Test',
        student_last_name: 'Student',
        student_date_of_birth: '2018-01-01',
        program_type: 'invalid_program',
        parent_first_name: 'Parent',
        parent_last_name: 'Test',
        parent_email: 'parent@example.com',
        parent_phone: '5551234567',
        address: '123 Test St',
        city: 'Test City',
        zip_code: '12345',
        emergency_contact_name: 'Emergency',
        emergency_contact_relationship: 'aunt',
        emergency_contact_phone: '5559876543',
        payment_method: 'monthly',
        terms_accepted: true,
        signature_name: 'Parent Test',
        signature_date: '2025-01-01'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Validation failed');
      
      const programTypeError = responseData.details.find(
        (detail: any) => detail.path.includes('program_type')
      );
      expect(programTypeError).toBeDefined();
    });

    test('should reject enrollment with invalid email format', async () => {
      const dataWithInvalidEmail = {
        student_first_name: 'Test',
        student_last_name: 'Student',
        student_date_of_birth: '2018-01-01',
        program_type: 'boys_recreational',
        parent_first_name: 'Parent',
        parent_last_name: 'Test',
        parent_email: 'not-an-email',
        parent_phone: '5551234567',
        address: '123 Test St',
        city: 'Test City',
        zip_code: '12345',
        emergency_contact_name: 'Emergency',
        emergency_contact_relationship: 'aunt',
        emergency_contact_phone: '5559876543',
        payment_method: 'monthly',
        terms_accepted: true,
        signature_name: 'Parent Test',
        signature_date: '2025-01-01'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithInvalidEmail)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      
      const emailError = responseData.details.find(
        (detail: any) => detail.path.includes('parent_email')
      );
      expect(emailError).toBeDefined();
    });

    test('should detect and handle duplicate enrollments', async () => {
      // Mock existing enrollment
      mockEnrollmentOperations.getByEmail.mockReturnValue([
        {
          id: 1,
          student_first_name: 'Emma',
          student_last_name: 'Wilson',
          parent_email: 'sarah.wilson@example.com',
          status: 'pending'
        }
      ] as any);

      const duplicateData = {
        student_first_name: 'Emma',
        student_last_name: 'Wilson',
        student_date_of_birth: '2018-05-15',
        program_type: 'girls_recreational',
        parent_first_name: 'Sarah',
        parent_last_name: 'Wilson',
        parent_email: 'sarah.wilson@example.com',
        parent_phone: '5551234567',
        address: '456 Maple St',
        city: 'Las Cruces',
        zip_code: '88001',
        emergency_contact_name: 'John Wilson',
        emergency_contact_relationship: 'father',
        emergency_contact_phone: '5559876543',
        payment_method: 'monthly',
        terms_accepted: true,
        signature_name: 'Sarah Wilson',
        signature_date: '2025-01-02'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.enrollmentExists).toBe(true);
      expect(responseData.error).toContain('Good news!');
      expect(responseData.studentName).toBe('Emma Wilson');
    });

    test('should reject enrollment when rate limited', async () => {
      mockRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000
      });

      const validData = {
        student_first_name: 'Test',
        student_last_name: 'Student',
        student_date_of_birth: '2018-01-01',
        program_type: 'boys_recreational',
        parent_first_name: 'Parent',
        parent_last_name: 'Test',
        parent_email: 'parent@example.com',
        parent_phone: '5551234567',
        address: '123 Test St',
        city: 'Test City',
        zip_code: '12345',
        emergency_contact_name: 'Emergency',
        emergency_contact_relationship: 'aunt',
        emergency_contact_phone: '5559876543',
        payment_method: 'monthly',
        terms_accepted: true,
        signature_name: 'Parent Test',
        signature_date: '2025-01-01'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(429);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Too many requests');
    });

    test('should reject enrollment with invalid phone number', async () => {
      const dataWithInvalidPhone = {
        student_first_name: 'Test',
        student_last_name: 'Student',
        student_date_of_birth: '2018-01-01',
        program_type: 'boys_recreational',
        parent_first_name: 'Parent',
        parent_last_name: 'Test',
        parent_email: 'parent@example.com',
        parent_phone: '123', // Too short
        address: '123 Test St',
        city: 'Test City',
        zip_code: '12345',
        emergency_contact_name: 'Emergency',
        emergency_contact_relationship: 'aunt',
        emergency_contact_phone: '456', // Too short
        payment_method: 'monthly',
        terms_accepted: true,
        signature_name: 'Parent Test',
        signature_date: '2025-01-01'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithInvalidPhone)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      
      const phoneErrors = responseData.details.filter(
        (detail: any) => detail.path.includes('phone')
      );
      expect(phoneErrors.length).toBeGreaterThan(0);
    });

    test('should handle database errors gracefully', async () => {
      mockEnrollmentOperations.create.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const validData = {
        student_first_name: 'Test',
        student_last_name: 'Student',
        student_date_of_birth: '2018-01-01',
        program_type: 'boys_recreational',
        parent_first_name: 'Parent',
        parent_last_name: 'Test',
        parent_email: 'parent@example.com',
        parent_phone: '5551234567',
        address: '123 Test St',
        city: 'Test City',
        zip_code: '12345',
        emergency_contact_name: 'Emergency',
        emergency_contact_relationship: 'aunt',
        emergency_contact_phone: '5559876543',
        payment_method: 'monthly',
        terms_accepted: true,
        signature_name: 'Parent Test',
        signature_date: '2025-01-01'
      };

      const request = new NextRequest('http://localhost:3000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to submit enrollment');
    });

    test('should validate all required program types', async () => {
      const validProgramTypes = [
        'boys_recreational',
        'girls_recreational',
        'boys_competitive',
        'girls_competitive',
        'ninja'
      ];

      for (const programType of validProgramTypes) {
        mockEnrollmentOperations.create.mockReturnValue({ id: 1 });
        
        const data = {
          student_first_name: 'Test',
          student_last_name: 'Student',
          student_date_of_birth: '2018-01-01',
          program_type: programType,
          parent_first_name: 'Parent',
          parent_last_name: 'Test',
          parent_email: 'parent@example.com',
          parent_phone: '5551234567',
          address: '123 Test St',
          city: 'Test City',
          zip_code: '12345',
          emergency_contact_name: 'Emergency',
          emergency_contact_relationship: 'aunt',
          emergency_contact_phone: '5559876543',
          payment_method: 'monthly',
          terms_accepted: true,
          signature_name: 'Parent Test',
          signature_date: '2025-01-01'
        };

        const request = new NextRequest('http://localhost:3000/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
      }
    });
  });
});