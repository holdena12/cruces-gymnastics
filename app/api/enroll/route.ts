import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enrollmentOperations, EnrollmentData } from '@/lib/dynamodb-data';
import { rateLimit, getSecurityHeaders, sanitizeInput as sanitizeSecurityInput, logSecurityEvent, createAuditLog } from '@/lib/security';

// Validation schema using Zod
const enrollmentSchema = z.object({
  // Student Information
  student_first_name: z.string().min(1, 'Student first name is required').max(50),
  student_last_name: z.string().min(1, 'Student last name is required').max(50),
  student_date_of_birth: z.string().min(1, 'Date of birth is required'),
  student_gender: z.string().optional(),
  previous_experience: z.string().optional(),
  
  // Program Selection
  program_type: z.enum(['boys_recreational', 'girls_recreational', 'boys_competitive', 'girls_competitive', 'ninja'], {
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
    // Apply enhanced rate limiting for enrollment submissions
    const rateLimitResult = rateLimit(request, 2, 10 * 60 * 1000); // 2 submissions per 10 minutes
    if (!rateLimitResult.allowed) {
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_RATE_LIMIT_EXCEEDED',
        resource: 'enrollments',
        details: { 
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.resetTime).toISOString()
        },
        success: false
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many enrollment submissions. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: getSecurityHeaders()
        }
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
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    const data = validationResult.data;
    console.log('✓ Validation passed');

    // Sanitize all inputs for security
    const sanitizedData: EnrollmentData = {
      student_first_name: data.student_first_name.trim(),
      student_last_name: data.student_last_name.trim(),
      student_date_of_birth: data.student_date_of_birth,
      student_gender: data.student_gender ? data.student_gender.trim() : undefined,
      previous_experience: data.previous_experience ? data.previous_experience.trim() : undefined,
      program_type: data.program_type,
      parent_first_name: data.parent_first_name.trim(),
      parent_last_name: data.parent_last_name.trim(),
      parent_email: data.parent_email.toLowerCase().trim(),
      parent_phone: data.parent_phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state ? data.state.trim() : undefined,
      zip_code: data.zip_code.trim(),
      emergency_contact_name: data.emergency_contact_name.trim(),
      emergency_contact_relationship: data.emergency_contact_relationship.trim(),
      emergency_contact_phone: data.emergency_contact_phone.trim(),
      emergency_contact_alt_phone: data.emergency_contact_alt_phone ? data.emergency_contact_alt_phone.trim() : undefined,
      allergies: data.allergies ? data.allergies.trim() : undefined,
      medical_conditions: data.medical_conditions ? data.medical_conditions.trim() : undefined,
      medications: data.medications ? data.medications.trim() : undefined,
      physician_name: data.physician_name ? data.physician_name.trim() : undefined,
      physician_phone: data.physician_phone ? data.physician_phone.trim() : undefined,
      payment_method: data.payment_method,
      terms_accepted: data.terms_accepted,
      photo_permission: data.photo_permission || false,
      email_updates: data.email_updates || false,
      signature_name: data.signature_name.trim(),
      signature_date: data.signature_date,
    };
    console.log('✓ Data sanitized');

    // Check for duplicate enrollment (same student + email combination)
    console.log('Checking for duplicate enrollment...');
    const existingEnrollments = await enrollmentOperations.getByEmail(sanitizedData.parent_email);
    
    // Check if this specific student is already enrolled
    const duplicateStudent = existingEnrollments.find((enrollment: any) => 
      enrollment.student_first_name.toLowerCase() === sanitizedData.student_first_name.toLowerCase() &&
      enrollment.student_last_name.toLowerCase() === sanitizedData.student_last_name.toLowerCase()
    );
    
    console.log('✓ Duplicate check completed, existing enrollments:', existingEnrollments.length);
    if (duplicateStudent) {
      logSecurityEvent(createAuditLog({
        action: 'ENROLLMENT_DUPLICATE_ATTEMPT',
        resource: 'enrollments',
        details: { 
          email: sanitizedData.parent_email,
          student: `${sanitizedData.student_first_name} ${sanitizedData.student_last_name}`
        },
        success: false
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Good news! ${sanitizedData.student_first_name} ${sanitizedData.student_last_name} already has an enrollment application on file with this email address. You don't need to submit another application.`,
          enrollmentExists: true,
          studentName: `${sanitizedData.student_first_name} ${sanitizedData.student_last_name}`,
          debug: {
            submitted: {
              student_first_name: sanitizedData.student_first_name,
              student_last_name: sanitizedData.student_last_name,
              parent_email: sanitizedData.parent_email
            },
            found_duplicate: duplicateStudent 
          }
        },
        { 
          status: 409,
          headers: getSecurityHeaders()
        }
      );
    }

    // Save to database
    console.log('Creating enrollment in database...');
    const result = await enrollmentOperations.create(sanitizedData);
    
    if (result.changes === 1) {
      console.log('New enrollment submitted:', {
        id: result.lastInsertRowid,
        student_name: `${sanitizedData.student_first_name} ${sanitizedData.student_last_name}`,
        parent_email: sanitizedData.parent_email,
        program: sanitizedData.program_type,
        timestamp: new Date().toISOString()
      });

      // Create success response with security headers
      const response = NextResponse.json({
        success: true,
        message: 'Enrollment application submitted successfully!',
        enrollmentId: result.lastInsertRowid
      });

      // Apply security headers
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } else {
      throw new Error('Failed to save enrollment data');
    }

  } catch (error) {
    console.error('Enrollment submission error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    logSecurityEvent(createAuditLog({
      action: 'ENROLLMENT_SUBMISSION_ERROR',
      resource: 'enrollments',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while processing your enrollment. Please try again later.',
        debug: error instanceof Error ? error.message : 'Unknown error' 
      },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
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
      const enrollment = await enrollmentOperations.getById(parseInt(id));
      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Enrollment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: enrollment });
    } else {
      const enrollments = await enrollmentOperations.getAll();
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