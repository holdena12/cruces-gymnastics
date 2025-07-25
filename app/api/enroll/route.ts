import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enrollmentOperations, EnrollmentData } from '@/lib/database';

// Validation schema using Zod
const enrollmentSchema = z.object({
  // Student Information
  student_first_name: z.string().min(1, 'Student first name is required').max(50),
  student_last_name: z.string().min(1, 'Student last name is required').max(50),
  student_date_of_birth: z.string().min(1, 'Date of birth is required'),
  student_gender: z.string().optional(),
  previous_experience: z.string().optional(),
  
  // Program Selection
  program_type: z.enum(['preschool', 'recreational', 'competitive', 'adult'], {
    message: 'Valid program type is required'
  }),
  
  // Parent/Guardian Information
  parent_first_name: z.string().min(1, 'Parent first name is required').max(50),
  parent_last_name: z.string().min(1, 'Parent last name is required').max(50),
  parent_email: z.string().email('Valid email address is required').max(100),
  parent_phone: z.string().min(10, 'Valid phone number is required').max(20),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().optional(),
  zip_code: z.string().min(5, 'Valid zip code is required').max(10),
  
  // Emergency Contact
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required').max(100),
  emergency_contact_relationship: z.string().min(1, 'Relationship is required').max(50),
  emergency_contact_phone: z.string().min(10, 'Valid emergency contact phone is required').max(20),
  emergency_contact_alt_phone: z.string().optional(),
  
  // Medical Information
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
  physician_name: z.string().optional(),
  physician_phone: z.string().optional(),
  
  // Payment Information
  payment_method: z.enum(['monthly', 'check', 'cash'], {
    message: 'Valid payment method is required'
  }),
  
  // Consent and Permissions
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  photo_permission: z.boolean().optional(),
  email_updates: z.boolean().optional(),
  
  // Signature
  signature_name: z.string().min(1, 'Electronic signature is required').max(100),
  signature_date: z.string().min(1, 'Signature date is required'),
});

// Rate limiting helper (simple in-memory store - for production use Redis)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3; // Max 3 enrollment submissions per 15 minutes per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return true;
  }
  
  const requests = rateLimitMap.get(ip).filter((time: number) => time > windowStart);
  
  if (requests.length >= MAX_REQUESTS) {
    return false;
  }
  
  requests.push(now);
  rateLimitMap.set(ip, requests);
  return true;
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many enrollment submissions. Please wait before trying again.' 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate the data
    const validationResult = enrollmentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Sanitize text inputs
    const sanitizedData: EnrollmentData = {
      student_first_name: sanitizeInput(data.student_first_name),
      student_last_name: sanitizeInput(data.student_last_name),
      student_date_of_birth: data.student_date_of_birth,
      student_gender: data.student_gender ? sanitizeInput(data.student_gender) : undefined,
      previous_experience: data.previous_experience ? sanitizeInput(data.previous_experience) : undefined,
      program_type: data.program_type,
      parent_first_name: sanitizeInput(data.parent_first_name),
      parent_last_name: sanitizeInput(data.parent_last_name),
      parent_email: data.parent_email.toLowerCase().trim(),
      parent_phone: sanitizeInput(data.parent_phone),
      address: sanitizeInput(data.address),
      city: sanitizeInput(data.city),
      state: data.state ? sanitizeInput(data.state) : undefined,
      zip_code: sanitizeInput(data.zip_code),
      emergency_contact_name: sanitizeInput(data.emergency_contact_name),
      emergency_contact_relationship: sanitizeInput(data.emergency_contact_relationship),
      emergency_contact_phone: sanitizeInput(data.emergency_contact_phone),
      emergency_contact_alt_phone: data.emergency_contact_alt_phone ? sanitizeInput(data.emergency_contact_alt_phone) : undefined,
      allergies: data.allergies ? sanitizeInput(data.allergies) : undefined,
      medical_conditions: data.medical_conditions ? sanitizeInput(data.medical_conditions) : undefined,
      medications: data.medications ? sanitizeInput(data.medications) : undefined,
      physician_name: data.physician_name ? sanitizeInput(data.physician_name) : undefined,
      physician_phone: data.physician_phone ? sanitizeInput(data.physician_phone) : undefined,
      payment_method: data.payment_method,
      terms_accepted: data.terms_accepted,
      photo_permission: data.photo_permission || false,
      email_updates: data.email_updates || false,
      signature_name: sanitizeInput(data.signature_name),
      signature_date: data.signature_date,
    };

    // Check for duplicate email
    const existingEnrollments = enrollmentOperations.getByEmail(sanitizedData.parent_email);
    if (existingEnrollments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An enrollment with this email address already exists. Please contact us if you need to update your information.' 
        },
        { status: 409 }
      );
    }

    // Save to database
    const result = enrollmentOperations.create(sanitizedData);
    
    if (result.changes === 1) {
      console.log('New enrollment submitted:', {
        id: result.lastInsertRowid,
        student_name: `${sanitizedData.student_first_name} ${sanitizedData.student_last_name}`,
        parent_email: sanitizedData.parent_email,
        program: sanitizedData.program_type,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment application submitted successfully!',
        enrollmentId: result.lastInsertRowid
      });
    } else {
      throw new Error('Failed to save enrollment data');
    }

  } catch (error) {
    console.error('Enrollment submission error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while processing your enrollment. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve enrollments (for admin use - you may want to add authentication)
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication here
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const enrollment = enrollmentOperations.getById(parseInt(id));
      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Enrollment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: enrollment });
    } else {
      const enrollments = enrollmentOperations.getAll();
      return NextResponse.json({ 
        success: true, 
        enrollments: enrollments.map((enrollment: any) => ({
          id: enrollment.id,
          student_first_name: enrollment.student_first_name,
          student_last_name: enrollment.student_last_name,
          parent_email: enrollment.parent_email,
          program_type: enrollment.program_type,
          submission_date: enrollment.submission_date,
          status: enrollment.status || 'pending'
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
} 