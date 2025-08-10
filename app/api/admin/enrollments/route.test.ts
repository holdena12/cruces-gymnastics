import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from './route';

// Mock dependencies
jest.mock('@/lib/dynamodb-auth');
jest.mock('@/lib/database');
jest.mock('@/lib/security');

// Import mocked modules
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';
import { enrollmentOperations } from '@/lib/dynamodb-data';
import { getSecurityHeaders } from '@/lib/security';

// Type the mocked modules
const mockAuthOperations = authOperations as jest.Mocked<typeof authOperations>;
const mockEnrollmentOperations = enrollmentOperations as jest.Mocked<typeof enrollmentOperations>;
const mockGetSecurityHeaders = getSecurityHeaders as jest.MockedFunction<typeof getSecurityHeaders>;

describe('/api/admin/enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetSecurityHeaders.mockReturnValue({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });

    // Mock admin user verification
    mockAuthOperations.verifyToken.mockResolvedValue({
      id: 1,
      email: 'admin@test.com',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      is_active: 1,
      created_at: '2025-01-01',
      last_login: '2025-01-01'
    });
  });

  describe('GET /api/admin/enrollments', () => {
    test('should return all enrollments for admin user', async () => {
      const mockEnrollments = [
        {
          id: 1,
          student_first_name: 'Emma',
          student_last_name: 'Wilson',
          program_type: 'girls_recreational',
          status: 'pending',
          parent_email: 'sarah.wilson@example.com',
          submission_date: '2025-01-01'
        },
        {
          id: 2,
          student_first_name: 'Tommy',
          student_last_name: 'Auto',
          program_type: 'boys_competitive',
          status: 'accepted',
          parent_email: 'mike.auto@example.com',
          submission_date: '2025-01-02'
        }
      ];

      mockEnrollmentOperations.getAll.mockReturnValue(Promise.resolve(mockEnrollments));

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-jwt-token'
        }
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.enrollments).toHaveLength(2);
      expect(responseData.enrollments[0].student_first_name).toBe('Emma');
      expect(responseData.enrollments[1].student_first_name).toBe('Tommy');
    });

    test('should reject access for non-admin users', async () => {
      mockAuthOperations.verifyToken.mockResolvedValue({
        id: 2,
        email: 'user@test.com',
        role: 'user', // Not admin
        first_name: 'Regular',
        last_name: 'User',
        is_active: 1,
        created_at: '2025-01-01',
        last_login: '2025-01-01'
      });

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer user-jwt-token'
        }
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Admin access required');
    });

    test('should reject access without authentication', async () => {
      mockAuthOperations.verifyToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'GET'
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Unauthorized');
    });

    test('should handle database errors gracefully', async () => {
      mockEnrollmentOperations.getAll.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-jwt-token'
        }
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Internal server error');
    });
  });

  describe('PATCH /api/admin/enrollments', () => {
    test('should successfully update enrollment status to accepted', async () => {
      mockEnrollmentOperations.updateStatus.mockReturnValue({ changes: 1 });

      const requestBody = {
        enrollmentId: 1,
        status: 'accepted'
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Enrollment status updated');
      expect(mockEnrollmentOperations.updateStatus).toHaveBeenCalledWith(1, 'accepted');
    });

    test('should successfully update enrollment status to rejected', async () => {
      mockEnrollmentOperations.updateStatus.mockReturnValue({ changes: 1 });

      const requestBody = {
        enrollmentId: 2,
        status: 'rejected'
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Enrollment status updated');
      expect(mockEnrollmentOperations.updateStatus).toHaveBeenCalledWith(2, 'rejected');
    });

    test('should reject update with missing enrollmentId', async () => {
      const requestBody = {
        status: 'accepted'
        // Missing enrollmentId
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Missing enrollmentId or status');
    });

    test('should reject update with missing status', async () => {
      const requestBody = {
        enrollmentId: 1
        // Missing status
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Missing enrollmentId or status');
    });

    test('should reject access for non-admin users', async () => {
      mockAuthOperations.verifyToken.mockResolvedValue({
        id: 2,
        email: 'user@test.com',
        role: 'user',
        first_name: 'Regular',
        last_name: 'User',
        is_active: 1,
        created_at: '2025-01-01',
        last_login: '2025-01-01'
      });

      const requestBody = {
        enrollmentId: 1,
        status: 'accepted'
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer user-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Admin access required');
    });

    test('should handle database update errors gracefully', async () => {
      mockEnrollmentOperations.updateStatus.mockImplementation(() => {
        throw new Error('Database update failed');
      });

      const requestBody = {
        enrollmentId: 1,
        status: 'accepted'
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to update status');
    });

    test('should trigger auto-enrollment when status is accepted', async () => {
      // This test verifies that the updateStatus is called, which should trigger auto-enrollment
      mockEnrollmentOperations.updateStatus.mockReturnValue({ changes: 1 });

      const requestBody = {
        enrollmentId: 1,
        status: 'accepted'
      };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await PATCH(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verify that updateStatus was called with correct parameters
      // The auto-enrollment logic is tested separately in database.test.ts
      expect(mockEnrollmentOperations.updateStatus).toHaveBeenCalledWith(1, 'accepted');
    });
  });

  describe('DELETE /api/admin/enrollments', () => {
    test('should successfully delete enrollment', async () => {
      mockEnrollmentOperations.delete.mockReturnValue({ changes: 1 });

      const requestBody = { id: 1 };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Enrollment deleted successfully');
      expect(mockEnrollmentOperations.delete).toHaveBeenCalledWith(1);
    });

    test('should reject delete with missing id', async () => {
      const requestBody = {}; // Missing id

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Missing enrollment ID');
    });

    test('should reject access for non-admin users', async () => {
      mockAuthOperations.verifyToken.mockResolvedValue({
        id: 2,
        email: 'user@test.com',
        role: 'user',
        first_name: 'Regular',
        last_name: 'User',
        is_active: 1,
        created_at: '2025-01-01',
        last_login: '2025-01-01'
      });

      const requestBody = { id: 1 };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer user-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Admin access required');
    });

    test('should handle database delete errors gracefully', async () => {
      mockEnrollmentOperations.delete.mockImplementation(() => {
        throw new Error('Database delete failed');
      });

      const requestBody = { id: 1 };

      const request = new NextRequest('http://localhost:3000/api/admin/enrollments', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to delete enrollment');
    });
  });
});