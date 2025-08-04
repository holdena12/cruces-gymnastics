import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { encryptSensitiveData, decryptSensitiveData, sanitizeInput, logSecurityEvent, createAuditLog } from './security';

// Database initialization with error handling
let db: Database.Database | null = null;

try {
  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database file
  const dbPath = path.join(dataDir, 'enrollment.db');
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
} catch (error) {
  console.error('Database initialization failed:', error);
  // Continue without database for build environments
}

// Create enrollments table
const createEnrollmentsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_first_name TEXT NOT NULL,
    student_last_name TEXT NOT NULL,
    student_date_of_birth TEXT,
    student_gender TEXT,
    previous_experience TEXT,
    program_type TEXT NOT NULL,
    parent_first_name TEXT,
    parent_last_name TEXT,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relationship TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_alt_phone TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    medications TEXT,
    physician_name TEXT,
    physician_phone TEXT,
    payment_method TEXT,
    terms_accepted BOOLEAN DEFAULT 0,
    photo_permission BOOLEAN DEFAULT 0,
    email_updates BOOLEAN DEFAULT 0,
    signature_name TEXT,
    signature_date TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  )
`);

// Create payments table
const createPaymentsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    enrollment_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    payment_type TEXT NOT NULL, -- 'registration', 'tuition', 'late_fee', 'equipment', 'birthday_party'
    payment_method TEXT, -- 'stripe', 'cash', 'check', 'bank_transfer'
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    stripe_payment_intent_id TEXT,
    stripe_payment_method_id TEXT,
    stripe_customer_id TEXT,
    currency TEXT DEFAULT 'usd',
    description TEXT,
    due_date DATE,
    paid_date DATETIME,
    refunded_date DATETIME,
    refund_amount DECIMAL(10,2),
    processing_fee DECIMAL(10,2),
    parent_email TEXT,
    billing_address TEXT,
    failure_reason TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
  )
`);

// Create classes table
const createClassesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    program_type TEXT NOT NULL,
    instructor_id INTEGER,
    day_of_week TEXT, -- 'monday', 'tuesday', etc.
    start_time TIME,
    end_time TIME,
    capacity INTEGER DEFAULT 10,
    age_min INTEGER,
    age_max INTEGER,
    skill_level TEXT, -- 'beginner', 'intermediate', 'advanced'
    monthly_price DECIMAL(10,2),
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create class enrollments (student-class relationships)
const createClassEnrollmentsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS class_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class_id INTEGER,
    enrollment_date DATE,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
  )
`);

// Create attendance table
const createAttendanceTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class_id INTEGER,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- 'present', 'absent', 'excused', 'late'
    check_in_time DATETIME,
    check_out_time DATETIME,
    notes TEXT,
    recorded_by INTEGER, -- instructor/admin user ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
  )
`);

// Create progress tracking table
const createProgressTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    skill_category TEXT NOT NULL, -- 'floor', 'vault', 'beam', 'bars'
    skill_name TEXT NOT NULL,
    skill_level TEXT, -- 'learning', 'practicing', 'mastered'
    assessment_date DATE,
    instructor_id INTEGER,
    notes TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create staff/coaches table
const createStaffTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- Link to auth users
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL, -- 'coach', 'assistant', 'manager'
    specializations TEXT, -- JSON array of specialties
    certifications TEXT, -- JSON array of certifications
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    active BOOLEAN DEFAULT 1,
    bio TEXT,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create communications table
const createCommunicationsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'announcement', 'email', 'sms', 'notification'
    title TEXT,
    message TEXT NOT NULL,
    recipient_type TEXT, -- 'all', 'students', 'parents', 'staff', 'specific'
    recipient_ids TEXT, -- JSON array of specific user IDs
    sender_id INTEGER,
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'scheduled'
    scheduled_date DATETIME,
    sent_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create make-up classes table
const createMakeupClassesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS makeup_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    original_class_id INTEGER,
    makeup_class_id INTEGER,
    original_date DATE,
    makeup_date DATE,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'scheduled', 'completed', 'expired'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_class_id) REFERENCES classes(id),
    FOREIGN KEY (makeup_class_id) REFERENCES classes(id)
  )
`);

// Initialize all tables
try {
  createEnrollmentsTable.run();
  createPaymentsTable.run();
  createClassesTable.run();
  createClassEnrollmentsTable.run();
  createAttendanceTable.run();
  createProgressTable.run();
  createStaffTable.run();
  createCommunicationsTable.run();
  createMakeupClassesTable.run();
  
  // Add sample classes if none exist
  const existingClasses = db.prepare('SELECT COUNT(*) as count FROM classes').get() as { count: number };
  if (existingClasses.count === 0) {
    const sampleClasses = [
      // Pre-School Gymnastics Classes
      {
        name: 'Pre-School Gymnastics',
        program_type: 'preschool',
        day_of_week: null,
        start_time: null,
        end_time: null,
        capacity: null,
        age_min: null,
        age_max: null,
        skill_level: null,
        monthly_price: null
      },
      // Boys Recreational Gymnastics
      {
        name: 'Boys Recreational Gymnastics',
        program_type: 'boys_recreational',
        day_of_week: null,
        start_time: null,
        end_time: null,
        capacity: null,
        age_min: null,
        age_max: null,
        skill_level: null,
        monthly_price: null
      },
      // Girls Recreational Gymnastics
      {
        name: 'Girls Recreational Gymnastics',
        program_type: 'girls_recreational',
        day_of_week: null,
        start_time: null,
        end_time: null,
        capacity: null,
        age_min: null,
        age_max: null,
        skill_level: null,
        monthly_price: null
      },
      // Boys Competitive Gymnastics
      {
        name: 'Boys Competitive Team',
        program_type: 'boys_competitive',
        day_of_week: null,
        start_time: null,
        end_time: null,
        capacity: null,
        age_min: null,
        age_max: null,
        skill_level: null,
        monthly_price: null
      },
      // Girls Competitive Gymnastics
      {
        name: 'Girls Competitive Team',
        program_type: 'girls_competitive',
        day_of_week: null,
        start_time: null,
        end_time: null,
        capacity: null,
        age_min: null,
        age_max: null,
        skill_level: null,
        monthly_price: null
      },
      // Ninja Classes
      {
        name: 'Ninja Classes',
        program_type: 'ninja',
        day_of_week: null,
        start_time: null,
        end_time: null,
        capacity: null,
        age_min: null,
        age_max: null,
        skill_level: null,
        monthly_price: null
      }
    ];

    const insertClass = db.prepare(`
      INSERT INTO classes (name, program_type, day_of_week, start_time, end_time, capacity, age_min, age_max, skill_level, monthly_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleClasses.forEach(classData => {
      insertClass.run(
        classData.name,
        classData.program_type,
        classData.day_of_week,
        classData.start_time,
        classData.end_time,
        classData.capacity,
        classData.age_min,
        classData.age_max || null,
        classData.skill_level,
        classData.monthly_price
      );
    });
    
    console.log('Sample classes added to database');
  }
  
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Error initializing database:', error);
}

// Enrollment Data Interface
export interface EnrollmentData {
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth?: string;
  student_gender?: string;
  previous_experience?: string;
  program_type: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  address: string;
  city: string;
  state?: string;
  zip_code: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  emergency_contact_alt_phone?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  physician_name?: string;
  physician_phone?: string;
  payment_method: string;
  terms_accepted: boolean;
  photo_permission?: boolean;
  email_updates?: boolean;
  signature_name: string;
  signature_date: string;
}

// Database Operations with Enhanced Security
export const enrollmentOperations = {
  create: (data: EnrollmentData) => {
    try {
      // Sanitize all text inputs
      const sanitizedData = {
        student_first_name: sanitizeInput(data.student_first_name),
        student_last_name: sanitizeInput(data.student_last_name),
        student_date_of_birth: data.student_date_of_birth,
        student_gender: data.student_gender ? sanitizeInput(data.student_gender) : undefined,
        previous_experience: data.previous_experience ? sanitizeInput(data.previous_experience) : undefined,
        program_type: data.program_type,
        parent_first_name: sanitizeInput(data.parent_first_name),
        parent_last_name: sanitizeInput(data.parent_last_name),
        parent_email: sanitizeInput(data.parent_email.toLowerCase()),
        parent_phone: sanitizeInput(data.parent_phone),
        address: sanitizeInput(data.address),
        city: sanitizeInput(data.city),
        state: data.state ? sanitizeInput(data.state) : undefined,
        zip_code: sanitizeInput(data.zip_code),
        emergency_contact_name: sanitizeInput(data.emergency_contact_name),
        emergency_contact_relationship: sanitizeInput(data.emergency_contact_relationship),
        emergency_contact_phone: sanitizeInput(data.emergency_contact_phone),
        emergency_contact_alt_phone: data.emergency_contact_alt_phone ? sanitizeInput(data.emergency_contact_alt_phone) : undefined,
        
        // Encrypt sensitive medical information
        allergies: data.allergies ? encryptSensitiveData(sanitizeInput(data.allergies)) : undefined,
        medical_conditions: data.medical_conditions ? encryptSensitiveData(sanitizeInput(data.medical_conditions)) : undefined,
        medications: data.medications ? encryptSensitiveData(sanitizeInput(data.medications)) : undefined,
        physician_name: data.physician_name ? encryptSensitiveData(sanitizeInput(data.physician_name)) : undefined,
        physician_phone: data.physician_phone ? encryptSensitiveData(sanitizeInput(data.physician_phone)) : undefined,
        
        payment_method: data.payment_method,
        terms_accepted: data.terms_accepted,
        photo_permission: data.photo_permission || false,
        email_updates: data.email_updates || false,
        signature_name: sanitizeInput(data.signature_name),
        signature_date: data.signature_date
      };

      const stmt = db.prepare(`
        INSERT INTO enrollments (
          student_first_name, student_last_name, student_date_of_birth, student_gender,
          previous_experience, program_type, parent_first_name, parent_last_name,
          parent_email, parent_phone, address, city, state, zip_code,
          emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
          emergency_contact_alt_phone, allergies, medical_conditions, medications,
          physician_name, physician_phone, payment_method, terms_accepted,
          photo_permission, email_updates, signature_name, signature_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        sanitizedData.student_first_name, sanitizedData.student_last_name, sanitizedData.student_date_of_birth,
        sanitizedData.student_gender, sanitizedData.previous_experience, sanitizedData.program_type,
        sanitizedData.parent_first_name, sanitizedData.parent_last_name, sanitizedData.parent_email,
        sanitizedData.parent_phone, sanitizedData.address, sanitizedData.city, sanitizedData.state, sanitizedData.zip_code,
        sanitizedData.emergency_contact_name, sanitizedData.emergency_contact_relationship,
        sanitizedData.emergency_contact_phone, sanitizedData.emergency_contact_alt_phone,
        sanitizedData.allergies, sanitizedData.medical_conditions, sanitizedData.medications,
        sanitizedData.physician_name, sanitizedData.physician_phone, sanitizedData.payment_method,
        sanitizedData.terms_accepted ? 1 : 0, sanitizedData.photo_permission ? 1 : 0, sanitizedData.email_updates ? 1 : 0,
        sanitizedData.signature_name, sanitizedData.signature_date
      );

      // Log enrollment creation for audit trail
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_CREATED',
        resource: 'enrollments',
        details: { 
          enrollmentId: result.lastInsertRowid, 
          studentName: `${sanitizedData.student_first_name} ${sanitizedData.student_last_name}`,
          parentEmail: sanitizedData.parent_email,
          program: sanitizedData.program_type
        },
        success: true
      }));

      return result;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_CREATION_ERROR',
        resource: 'enrollments',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      }));
      throw error;
    }
  },

  getAll: () => {
    try {
      const enrollments = db.prepare('SELECT * FROM enrollments ORDER BY submission_date DESC').all() as any[];
      
      // Decrypt sensitive medical data for display
      return enrollments.map(enrollment => ({
        ...enrollment,
        allergies: enrollment.allergies ? decryptSensitiveData(enrollment.allergies) : enrollment.allergies,
        medical_conditions: enrollment.medical_conditions ? decryptSensitiveData(enrollment.medical_conditions) : enrollment.medical_conditions,
        medications: enrollment.medications ? decryptSensitiveData(enrollment.medications) : enrollment.medications,
        physician_name: enrollment.physician_name ? decryptSensitiveData(enrollment.physician_name) : enrollment.physician_name,
        physician_phone: enrollment.physician_phone ? decryptSensitiveData(enrollment.physician_phone) : enrollment.physician_phone
      }));
    } catch (error) {
      console.error('Error retrieving enrollments:', error);
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_RETRIEVAL_ERROR',
        resource: 'enrollments',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      }));
      throw error;
    }
  },

  getById: (id: number) => {
    try {
      const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id) as any;
      
      if (!enrollment) return null;
      
      // Decrypt sensitive medical data for display
      const decryptedEnrollment = {
        ...enrollment,
        allergies: enrollment.allergies ? decryptSensitiveData(enrollment.allergies) : enrollment.allergies,
        medical_conditions: enrollment.medical_conditions ? decryptSensitiveData(enrollment.medical_conditions) : enrollment.medical_conditions,
        medications: enrollment.medications ? decryptSensitiveData(enrollment.medications) : enrollment.medications,
        physician_name: enrollment.physician_name ? decryptSensitiveData(enrollment.physician_name) : enrollment.physician_name,
        physician_phone: enrollment.physician_phone ? decryptSensitiveData(enrollment.physician_phone) : enrollment.physician_phone
      };

      // Log data access for audit trail
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_ACCESSED',
        resource: 'enrollments',
        details: { 
          enrollmentId: id,
          studentName: `${enrollment.student_first_name} ${enrollment.student_last_name}`
        },
        success: true
      }));

      return decryptedEnrollment;
    } catch (error) {
      console.error('Error retrieving enrollment by ID:', error);
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_ACCESS_ERROR',
        resource: 'enrollments',
        details: { enrollmentId: id, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      }));
      throw error;
    }
  },

  getByEmail: (email: string) => {
    return db.prepare('SELECT * FROM enrollments WHERE parent_email = ?').all(email);
  },

  updateStatus: (id: number, status: string) => {
    const result = db.prepare('UPDATE enrollments SET status = ? WHERE id = ?').run(status, id);
    
    // Auto-enroll student into appropriate class when enrollment is accepted
    if (status === 'accepted' && result.changes > 0) {
      try {
        const enrollment = enrollmentOperations.getById(id);
        if (enrollment) {
          const appropriateClass = enrollmentOperations.findBestClass(enrollment) as any;
          if (appropriateClass) {
            classOperations.enrollStudent(id, appropriateClass.id);
            console.log(`Auto-enrolled student ${enrollment.student_first_name} ${enrollment.student_last_name} into class: ${appropriateClass.name}`);
          }
        }
      } catch (error) {
        console.error('Error auto-enrolling student into class:', error);
      }
    }
    
    return result;
  },

  // Find the best matching class for a student based on their enrollment info
  findBestClass: (enrollment: any) => {
    const programType = enrollment.program_type;
    const studentAge = enrollment.student_date_of_birth ? 
      Math.floor((Date.now() - new Date(enrollment.student_date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
      null;
    
    // Get all classes for the program type
    const classes = db.prepare(`
      SELECT * FROM classes 
      WHERE program_type = ? AND active = 1
      ORDER BY age_min ASC
    `).all(programType) as any[];
    
    if (!classes.length) return null;
    
    // If we have age info, find the best age match
    if (studentAge !== null) {
      const ageMatchedClasses = classes.filter((cls: any) => 
        (!cls.age_min || studentAge >= cls.age_min) && 
        (!cls.age_max || studentAge <= cls.age_max)
      );
      
      if (ageMatchedClasses.length > 0) {
        // Prefer classes with available spots
        const classesWithSpace = ageMatchedClasses.filter((cls: any) => {
          const currentEnrollment = classOperations.getEnrollmentCount(cls.id);
          return cls.capacity == null || currentEnrollment < cls.capacity;
        });
        
        return classesWithSpace.length > 0 ? classesWithSpace[0] : ageMatchedClasses[0];
      }
    }
    
    // Fallback to first available class in the program type
    const classesWithSpace = classes.filter((cls: any) => {
      const currentEnrollment = classOperations.getEnrollmentCount(cls.id);
      return cls.capacity == null || currentEnrollment < cls.capacity;
    });
    
    return classesWithSpace.length > 0 ? classesWithSpace[0] : classes[0];
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM enrollments WHERE id = ?').run(id);
  }
};

// Payment Operations
const oldPaymentOperations = {
  create: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO payments (student_id, enrollment_id, amount, payment_type, payment_method, 
                           payment_status, due_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.student_id, data.enrollment_id, data.amount, data.payment_type,
                   data.payment_method, data.payment_status, data.due_date, data.notes);
  },

  getAll: () => db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all(),
  
  getByStudent: (studentId: number) => 
    db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY due_date DESC').all(studentId),
    
  updateStatus: (id: number, status: string, paidDate?: string) => 
    db.prepare('UPDATE payments SET payment_status = ?, paid_date = ? WHERE id = ?').run(status, paidDate, id),
    
  getOverdue: () => 
    db.prepare('SELECT * FROM payments WHERE payment_status = "pending" AND due_date < date("now")').all()
};

// Class Operations
export const classOperations = {
  create: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO classes (name, program_type, instructor_id, day_of_week, start_time, 
                          end_time, capacity, age_min, age_max, skill_level, monthly_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.name, data.program_type, data.instructor_id, data.day_of_week,
                   data.start_time, data.end_time, data.capacity, data.age_min, 
                   data.age_max, data.skill_level, data.monthly_price);
  },

  getAll: () => db.prepare('SELECT * FROM classes WHERE active = 1 ORDER BY day_of_week, start_time').all(),
  
  getById: (id: number) => db.prepare('SELECT * FROM classes WHERE id = ?').get(id),
  
  getByDay: (day: string) => 
    db.prepare('SELECT * FROM classes WHERE day_of_week = ? AND active = 1 ORDER BY start_time').all(day),
    
  enrollStudent: (studentId: number, classId: number) => {
    const stmt = db.prepare(`
      INSERT INTO class_enrollments (student_id, class_id, enrollment_date)
      VALUES (?, ?, date('now'))
    `);
    return stmt.run(studentId, classId);
  },
  
  getEnrollmentCount: (classId: number) => {
    const result = db.prepare('SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = ? AND status = ?').get(classId, 'active') as { count: number };
    return result.count;
  }
};

// Attendance Operations
export const attendanceOperations = {
  markAttendance: (data: any) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO attendance (student_id, class_id, date, status, check_in_time, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.student_id, data.class_id, data.date, data.status, 
                   data.check_in_time, data.notes, data.recorded_by);
  },

  getByClass: (classId: number, date: string) => 
    db.prepare('SELECT * FROM attendance WHERE class_id = ? AND date = ?').all(classId, date),
    
  getByStudent: (studentId: number, startDate?: string, endDate?: string) => {
    if (startDate && endDate) {
      return db.prepare('SELECT * FROM attendance WHERE student_id = ? AND date BETWEEN ? AND ?')
               .all(studentId, startDate, endDate);
    }
    return db.prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 50')
             .all(studentId);
  }
};

// Progress Operations
export const progressOperations = {
  addProgress: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO student_progress (student_id, skill_category, skill_name, skill_level, 
                                   assessment_date, instructor_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.student_id, data.skill_category, data.skill_name, data.skill_level,
                   data.assessment_date, data.instructor_id, data.notes);
  },

  getByStudent: (studentId: number) => 
    db.prepare('SELECT * FROM student_progress WHERE student_id = ? ORDER BY assessment_date DESC').all(studentId),
    
  getByCategory: (studentId: number, category: string) => 
    db.prepare('SELECT * FROM student_progress WHERE student_id = ? AND skill_category = ?').all(studentId, category)
};

// Staff Operations
export const staffOperations = {
  create: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO staff (user_id, first_name, last_name, email, phone, role, 
                        specializations, certifications, hire_date, hourly_rate, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.user_id, data.first_name, data.last_name, data.email, data.phone,
                   data.role, data.specializations, data.certifications, data.hire_date,
                   data.hourly_rate, data.bio);
  },

  getAll: () => db.prepare('SELECT * FROM staff WHERE active = 1 ORDER BY last_name').all(),
  
  getInstructors: () => db.prepare('SELECT * FROM staff WHERE role = "coach" AND active = 1').all(),
  
  getById: (id: number) => db.prepare('SELECT * FROM staff WHERE id = ?').get(id)
};

// Communication Operations
export const communicationOperations = {
  create: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO communications (type, title, message, recipient_type, recipient_ids, 
                                 sender_id, status, scheduled_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.type, data.title, data.message, data.recipient_type,
                   data.recipient_ids, data.sender_id, data.status, data.scheduled_date);
  },

  getAll: () => db.prepare('SELECT * FROM communications ORDER BY created_at DESC').all(),
  
  getPending: () => db.prepare('SELECT * FROM communications WHERE status = "scheduled" AND scheduled_date <= datetime("now")').all(),
  
  markSent: (id: number) => db.prepare('UPDATE communications SET status = "sent", sent_date = datetime("now") WHERE id = ?').run(id)
};

// Payment Operations
export const paymentOperations = {
  create: (data: any) => {
    const stmt = db.prepare(`
      INSERT INTO payments (student_id, enrollment_id, amount, payment_type, payment_method, 
                          payment_status, stripe_payment_intent_id, stripe_customer_id, 
                          currency, description, due_date, parent_email, billing_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.student_id, data.enrollment_id, data.amount, data.payment_type, 
      data.payment_method, data.payment_status, data.stripe_payment_intent_id,
      data.stripe_customer_id, data.currency || 'usd', data.description,
      data.due_date, data.parent_email, data.billing_address
    );
  },

  updateStatus: (id: number, status: string, additionalData: any = {}) => {
    const updateFields = ['payment_status = ?'];
    const values = [status];

    if (status === 'completed' && !additionalData.paid_date) {
      updateFields.push('paid_date = datetime("now")');
    }

    if (additionalData.paid_date) {
      updateFields.push('paid_date = ?');
      values.push(additionalData.paid_date);
    }

    if (additionalData.failure_reason) {
      updateFields.push('failure_reason = ?');
      values.push(additionalData.failure_reason);
    }

    if (additionalData.receipt_url) {
      updateFields.push('receipt_url = ?');
      values.push(additionalData.receipt_url);
    }

    if (additionalData.stripe_payment_method_id) {
      updateFields.push('stripe_payment_method_id = ?');
      values.push(additionalData.stripe_payment_method_id);
    }

    updateFields.push('updated_at = datetime("now")');
    values.push(id.toString());

    const stmt = db.prepare(`UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  },

  createRefund: (paymentId: number, refundAmount: number, reason: string) => {
    const stmt = db.prepare(`
      UPDATE payments 
      SET payment_status = 'refunded', 
          refund_amount = ?, 
          refunded_date = datetime("now"),
          notes = COALESCE(notes, '') || ' | Refund: ' || ?,
          updated_at = datetime("now")
      WHERE id = ?
    `);
    return stmt.run(refundAmount, reason, paymentId);
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
  },

  getByEnrollmentId: (enrollmentId: number) => {
    return db.prepare('SELECT * FROM payments WHERE enrollment_id = ? ORDER BY created_at DESC').all(enrollmentId);
  },

  getByStripePaymentIntentId: (paymentIntentId: string) => {
    return db.prepare('SELECT * FROM payments WHERE stripe_payment_intent_id = ?').get(paymentIntentId);
  },

  getByParentEmail: (email: string) => {
    return db.prepare('SELECT * FROM payments WHERE parent_email = ? ORDER BY created_at DESC').all(email);
  },

  getPendingPayments: () => {
    return db.prepare(`
      SELECT p.*, e.student_first_name, e.student_last_name, e.parent_first_name, e.parent_last_name
      FROM payments p
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      WHERE p.payment_status = 'pending' AND p.due_date <= date('now')
      ORDER BY p.due_date ASC
    `).all();
  },

  getRevenueReport: (startDate: string, endDate: string) => {
    return db.prepare(`
      SELECT 
        payment_type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM payments 
      WHERE payment_status = 'completed' 
        AND paid_date BETWEEN ? AND ?
      GROUP BY payment_type
      ORDER BY total_amount DESC
    `).all(startDate, endDate);
  },

  getAll: () => {
    return db.prepare(`
      SELECT p.*, e.student_first_name, e.student_last_name, e.parent_first_name, e.parent_last_name
      FROM payments p
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      ORDER BY p.created_at DESC
    `).all();
  },

  getMonthlyRecurringPayments: () => {
    return db.prepare(`
      SELECT DISTINCT p.parent_email, p.stripe_customer_id, e.student_first_name, e.student_last_name
      FROM payments p
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      WHERE p.payment_type = 'tuition' 
        AND p.payment_status = 'completed'
        AND p.stripe_customer_id IS NOT NULL
    `).all();
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM payments WHERE id = ?').run(id);
  }
};

export default db; 