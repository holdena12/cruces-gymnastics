// DynamoDB Schema Design for Cruces Gymnastics Center
// Using single-table design for optimal performance

export interface DynamoDBItem {
  PK: string;  // Partition Key
  SK: string;  // Sort Key
  [key: string]: any;
}

// Table: cruces-gymnastics-data
// PK (Partition Key) | SK (Sort Key) | Data
// -------------------|----------------|------------------
// USER#email         | PROFILE#email  | User profile data
// USER#email         | SESSION#token  | User sessions
// ENROLLMENT#id      | ENROLLMENT#id  | Student enrollment
// CLASS#id           | CLASS#id       | Class information
// PAYMENT#id         | PAYMENT#id     | Payment records
// STAFF#id           | STAFF#id       | Staff/coach data
// AUDIT#timestamp    | AUDIT#id       | Audit logs

export const TableName = 'cruces-gymnastics-data';

// User/Authentication Items
export interface UserItem extends DynamoDBItem {
  PK: `USER#${string}`; // USER#email@example.com
  SK: `PROFILE#${string}`; // PROFILE#email@example.com
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'coach';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  passwordHash: string;
}

export interface SessionItem extends DynamoDBItem {
  PK: `USER#${string}`; // USER#email@example.com
  SK: `SESSION#${string}`; // SESSION#token
  token: string;
  expiresAt: string;
  userId: string;
}

// Enrollment Items
export interface EnrollmentItem extends DynamoDBItem {
  PK: `ENROLLMENT#${string}`; // ENROLLMENT#enrollment-id
  SK: `ENROLLMENT#${string}`; // ENROLLMENT#enrollment-id
  id: string;
  studentFirstName: string;
  studentLastName: string;
  studentDateOfBirth?: string;
  studentGender?: string;
  previousExperience?: string;
  programType: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAltPhone?: string;
  allergies?: string; // Encrypted
  medicalConditions?: string; // Encrypted
  medications?: string; // Encrypted
  physicianName?: string; // Encrypted
  physicianPhone?: string; // Encrypted
  paymentMethod: string;
  termsAccepted: boolean;
  photoPermission?: boolean;
  emailUpdates?: boolean;
  signatureName: string;
  signatureDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlist';
  submissionDate: string;
  notes?: string;
}

// Class Items
export interface ClassItem extends DynamoDBItem {
  PK: `CLASS#${string}`; // CLASS#class-id
  SK: `CLASS#${string}`; // CLASS#class-id
  id: string;
  name: string;
  programType: string;
  instructorId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  capacity: number;
  ageMin?: number;
  ageMax?: number;
  skillLevel?: string;
  monthlyPrice?: number;
  isActive: boolean;
  createdAt: string;
}

// Payment Items
export interface PaymentItem extends DynamoDBItem {
  PK: `PAYMENT#${string}`; // PAYMENT#payment-id
  SK: `PAYMENT#${string}`; // PAYMENT#payment-id
  id: string;
  enrollmentId: string;
  amount: number;
  paymentType: 'registration' | 'tuition' | 'late_fee' | 'equipment' | 'birthday_party';
  description?: string;
  customerEmail?: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  receiptUrl?: string;
  notes?: string;
}

// Staff/Coach Items
export interface StaffItem extends DynamoDBItem {
  PK: `STAFF#${string}`; // STAFF#staff-id
  SK: `STAFF#${string}`; // STAFF#staff-id
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'coach' | 'instructor' | 'admin';
  specialties?: string[];
  certifications?: string[];
  isActive: boolean;
  hireDate: string;
  bio?: string;
}

// Audit Log Items
export interface AuditItem extends DynamoDBItem {
  PK: `AUDIT#${string}`; // AUDIT#timestamp
  SK: `AUDIT#${string}`; // AUDIT#audit-id
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  details?: any;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// GSI (Global Secondary Index) for queries
export const GSI1 = {
  name: 'GSI1',
  PK: 'SK', // Use SK as PK for GSI
  SK: 'PK'  // Use PK as SK for GSI
};

// Query patterns this schema supports:
// 1. Get user by email: PK = USER#email, SK = PROFILE#email
// 2. Get user sessions: PK = USER#email, SK starts with SESSION#
// 3. Get enrollments by status: Scan with filter on status
// 4. Get classes by program type: Scan with filter on programType
// 5. Get payments by enrollment: Scan with filter on enrollmentId
// 6. Get audit logs by date range: PK starts with AUDIT#, SK range query 