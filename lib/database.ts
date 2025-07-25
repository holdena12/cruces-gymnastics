import Database from 'better-sqlite3';
import path from 'path';

// Create database file
const dbPath = path.join(process.cwd(), 'data', 'enrollment.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

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
    payment_type TEXT NOT NULL, -- 'tuition', 'registration', 'late_fee', 'equipment'
    payment_method TEXT, -- 'card', 'cash', 'check', 'auto'
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    stripe_payment_id TEXT,
    due_date DATE,
    paid_date DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    day_of_week TEXT NOT NULL, -- 'monday', 'tuesday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
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

// Database Operations
export const enrollmentOperations = {
  create: (data: EnrollmentData) => {
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
    
    return stmt.run(
      data.student_first_name, data.student_last_name, data.student_date_of_birth,
      data.student_gender, data.previous_experience, data.program_type,
      data.parent_first_name, data.parent_last_name, data.parent_email,
      data.parent_phone, data.address, data.city, data.state, data.zip_code,
      data.emergency_contact_name, data.emergency_contact_relationship,
      data.emergency_contact_phone, data.emergency_contact_alt_phone,
      data.allergies, data.medical_conditions, data.medications,
      data.physician_name, data.physician_phone, data.payment_method,
      data.terms_accepted, data.photo_permission, data.email_updates,
      data.signature_name, data.signature_date
    );
  },

  getAll: () => {
    return db.prepare('SELECT * FROM enrollments ORDER BY submission_date DESC').all();
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id);
  },

  getByEmail: (email: string) => {
    return db.prepare('SELECT * FROM enrollments WHERE parent_email = ?').all(email);
  },

  updateStatus: (id: number, status: string) => {
    return db.prepare('UPDATE enrollments SET status = ? WHERE id = ?').run(status, id);
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM enrollments WHERE id = ?').run(id);
  }
};

// Payment Operations
export const paymentOperations = {
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
    const result = db.prepare('SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = ? AND status = "active"').get(classId) as { count: number };
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

export default db; 