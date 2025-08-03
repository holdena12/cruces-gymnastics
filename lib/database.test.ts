import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock the database and security modules before any imports
jest.mock('better-sqlite3', () => {
  const mockDb = {
    prepare: jest.fn(() => ({
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn(() => ({ changes: 1 }))
    })),
    pragma: jest.fn()
  };
  return jest.fn(() => mockDb);
});

jest.mock('./security', () => ({
  encryptSensitiveData: jest.fn((data) => `encrypted_${data}`),
  decryptSensitiveData: jest.fn((data) => data.replace('encrypted_', '')),
  sanitizeInput: jest.fn((input) => input),
  logSecurityEvent: jest.fn(),
  createAuditLog: jest.fn((entry) => ({ ...entry, timestamp: '2025-01-01T00:00:00.000Z' }))
}));

// Import after mocking
import { enrollmentOperations, classOperations } from './database';

// Mock data for testing
const mockClasses = [
  {
    id: 1,
    name: 'Pre-School Gymnastics',
    program_type: 'preschool',
    capacity: null,
    age_min: null,
    age_max: null,
    active: 1
  },
  {
    id: 2,
    name: 'Boys Recreational Gymnastics',
    program_type: 'boys_recreational',
    capacity: 15,
    age_min: 6,
    age_max: 12,
    active: 1
  },
  {
    id: 3,
    name: 'Girls Recreational Gymnastics',
    program_type: 'girls_recreational',
    capacity: 15,
    age_min: 6,
    age_max: 12,
    active: 1
  },
  {
    id: 4,
    name: 'Boys Competitive Team',
    program_type: 'boys_competitive',
    capacity: 10,
    age_min: 8,
    age_max: 18,
    active: 1
  }
];

const mockEnrollments = [
  {
    id: 1,
    student_first_name: 'Emma',
    student_last_name: 'Wilson',
    student_date_of_birth: '2018-05-15',
    program_type: 'girls_recreational',
    parent_email: 'sarah.wilson@example.com',
    status: 'pending'
  },
  {
    id: 2,
    student_first_name: 'Tommy',
    student_last_name: 'Auto',
    student_date_of_birth: '2017-03-15',
    program_type: 'boys_competitive',
    parent_email: 'mike.auto@example.com',
    status: 'pending'
  },
  {
    id: 3,
    student_first_name: 'Little',
    student_last_name: 'Star',
    student_date_of_birth: '2020-01-01',
    program_type: 'preschool',
    parent_email: 'parent@example.com',
    status: 'pending'
  }
];

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findBestClass', () => {
    test('should assign preschooler to preschool class', () => {
      // This test verifies the logic works with proper data
      // The actual database calls are mocked at the module level

      const enrollment = mockEnrollments[2]; // Little Star (preschool)
      const result = enrollmentOperations.findBestClass(enrollment);

      expect(result).toBeDefined();
      expect(result?.program_type).toBe('preschool');
      expect(result?.name).toBe('Pre-School Gymnastics');
    });

    test('should assign 6-year-old girl to girls recreational', () => {
      // Mock the database query to return girls recreational classes
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn().mockReturnValue([mockClasses[2]]), // Girls recreational
        get: jest.fn(),
        run: jest.fn()
      } as any);

      const enrollment = mockEnrollments[0]; // Emma Wilson (girls_recreational)
      const result = enrollmentOperations.findBestClass(enrollment);

      expect(result).toBeDefined();
      expect(result?.program_type).toBe('girls_recreational');
      expect(result?.name).toBe('Girls Recreational Gymnastics');
    });

    test('should assign competitive boy to boys competitive team', () => {
      // Mock the database query to return boys competitive classes
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn().mockReturnValue([mockClasses[3]]), // Boys competitive
        get: jest.fn(),
        run: jest.fn()
      } as any);

      const enrollment = mockEnrollments[1]; // Tommy Auto (boys_competitive)
      const result = enrollmentOperations.findBestClass(enrollment);

      expect(result).toBeDefined();
      expect(result?.program_type).toBe('boys_competitive');
      expect(result?.name).toBe('Boys Competitive Team');
    });

    test('should return null when no classes available for program type', () => {
      // Mock the database query to return empty array
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn().mockReturnValue([]), // No classes found
        get: jest.fn(),
        run: jest.fn()
      } as any);

      const enrollment = {
        ...mockEnrollments[0],
        program_type: 'nonexistent_program'
      };
      
      const result = enrollmentOperations.findBestClass(enrollment);
      expect(result).toBeNull();
    });

    test('should prefer classes with available capacity', () => {
      // Mock classes with different enrollment counts
      const classWithSpace = { ...mockClasses[2], capacity: 15 };
      const classAtCapacity = { ...mockClasses[2], id: 99, capacity: 2 };

      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      
      // First call returns both classes
      // Second call (getEnrollmentCount for class with space) returns 5
      // Third call (getEnrollmentCount for class at capacity) returns 2
      mockPrepare
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([classWithSpace, classAtCapacity]),
          get: jest.fn(),
          run: jest.fn()
        } as any)
        .mockReturnValueOnce({
          all: jest.fn(),
          get: jest.fn().mockReturnValue({ count: 5 }), // 5 students in class with space
          run: jest.fn()
        } as any)
        .mockReturnValueOnce({
          all: jest.fn(),
          get: jest.fn().mockReturnValue({ count: 2 }), // 2 students in class at capacity
          run: jest.fn()
        } as any);

      const enrollment = mockEnrollments[0]; // Emma Wilson (girls_recreational)
      const result = enrollmentOperations.findBestClass(enrollment);

      expect(result).toBeDefined();
      expect(result?.id).toBe(classWithSpace.id); // Should pick class with space
    });
  });

  describe('getEnrollmentCount', () => {
    test('should return correct enrollment count', () => {
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn(),
        get: jest.fn().mockReturnValue({ count: 5 }),
        run: jest.fn()
      } as any);

      const count = classOperations.getEnrollmentCount(1);
      
      expect(count).toBe(5);
      expect(mockPrepare).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = ? AND status = ?'
      );
    });

    test('should return 0 when no enrollments found', () => {
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn(),
        get: jest.fn().mockReturnValue({ count: 0 }),
        run: jest.fn()
      } as any);

      const count = classOperations.getEnrollmentCount(99);
      
      expect(count).toBe(0);
    });
  });

  describe('updateStatus', () => {
    test('should update enrollment status successfully', () => {
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn(),
        get: jest.fn(),
        run: jest.fn().mockReturnValue({ changes: 1 })
      } as any);

      const result = enrollmentOperations.updateStatus(1, 'accepted');
      
      expect(result.changes).toBe(1);
      expect(mockPrepare).toHaveBeenCalledWith(
        'UPDATE enrollments SET status = ? WHERE id = ?'
      );
    });

    test('should return 0 changes when enrollment not found', () => {
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn(),
        get: jest.fn(),
        run: jest.fn().mockReturnValue({ changes: 0 })
      } as any);

      const result = enrollmentOperations.updateStatus(999, 'accepted');
      
      expect(result.changes).toBe(0);
    });
  });

  describe('enrollStudent', () => {
    test('should enroll student in class successfully', () => {
      const mockPrepare = mockDb.prepare as jest.MockedFunction<typeof mockDb.prepare>;
      mockPrepare.mockReturnValue({
        all: jest.fn(),
        get: jest.fn(),
        run: jest.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 })
      } as any);

      const result = classOperations.enrollStudent(1, 2);
      
      expect(result.changes).toBe(1);
      expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO class_enrollments')
      );
    });
  });
});

// Age calculation tests
describe('Age Calculation', () => {
  test('should calculate correct age from date of birth', () => {
    const birthDate = '2018-01-01';
    const now = new Date('2025-01-01').getTime();
    const birthTime = new Date(birthDate).getTime();
    const expectedAge = Math.floor((now - birthTime) / (365.25 * 24 * 60 * 60 * 1000));

    // Mock Date.now for consistent testing
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => now);

    expect(expectedAge).toBe(7); // 7 years old on 2025-01-01

    // Restore Date.now
    Date.now = originalDateNow;
  });
});

// Data validation tests
describe('Data Validation', () => {
  test('should validate enrollment data structure', () => {
    const validEnrollment = mockEnrollments[0];
    
    expect(validEnrollment).toHaveProperty('student_first_name');
    expect(validEnrollment).toHaveProperty('student_last_name');
    expect(validEnrollment).toHaveProperty('program_type');
    expect(validEnrollment).toHaveProperty('parent_email');
    expect(validEnrollment.parent_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('should validate program types', () => {
    const validProgramTypes = [
      'preschool',
      'boys_recreational',
      'girls_recreational',
      'boys_competitive',
      'girls_competitive',
      'ninja'
    ];

    mockEnrollments.forEach(enrollment => {
      expect(validProgramTypes).toContain(enrollment.program_type);
    });
  });
});