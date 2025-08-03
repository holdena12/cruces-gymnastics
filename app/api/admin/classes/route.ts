import { NextRequest, NextResponse } from 'next/server';
import { classOperations, enrollmentOperations } from '@/lib/database';
import { authOperations } from '@/lib/auth-database';
import Database from 'better-sqlite3';
import path from 'path';

// Database connection (reusing the same connection pattern)
const dbPath = path.join(process.cwd(), 'data', 'enrollment.db');
const db = new Database(dbPath);

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const result = authOperations.verifyToken(token);
  if (!result.valid || result.user.role !== 'admin') {
    return null;
  }

  return result.user;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all classes
    const classes = classOperations.getAll();
    
    // For each class, get enrolled students from class_enrollments table
    const classesWithEnrollments = classes.map((classItem: any) => {
      // Get students actually enrolled in this specific class
      const enrolledStudents = db.prepare(`
        SELECT 
          ce.id as class_enrollment_id,
          ce.enrollment_date,
          ce.status as enrollment_status,
          e.id as enrollment_id,
          e.student_first_name,
          e.student_last_name,
          e.parent_email,
          e.parent_first_name,
          e.parent_last_name,
          e.submission_date
        FROM class_enrollments ce
        LEFT JOIN enrollments e ON ce.student_id = e.id
        WHERE ce.class_id = ? AND ce.status = 'active' AND e.status = 'accepted'
        ORDER BY e.student_first_name, e.student_last_name
      `).all(classItem.id);

      return {
        ...classItem,
        enrolled_students: enrolledStudents.map((student: any) => ({
          id: student.enrollment_id,
          class_enrollment_id: student.class_enrollment_id,
          student_name: `${student.student_first_name} ${student.student_last_name}`,
          student_first_name: student.student_first_name,
          student_last_name: student.student_last_name,
          parent_email: student.parent_email,
          enrollment_date: student.enrollment_date,
          submission_date: student.submission_date,
        })),
        enrollment_count: enrolledStudents.length,
        available_spots: classItem.capacity - enrolledStudents.length
      };
    });

    return NextResponse.json({
      success: true,
      classes: classesWithEnrollments
    });

  } catch (error) {
    console.error('Admin classes API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      program_type, 
      instructor_id, 
      day_of_week, 
      start_time, 
      end_time, 
      capacity, 
      age_min, 
      age_max, 
      skill_level, 
      monthly_price 
    } = body;

    if (!name || !program_type || !day_of_week || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, error: 'Name, program type, day, start time, and end time are required' },
        { status: 400 }
      );
    }

    const result = classOperations.create({
      name,
      program_type,
      instructor_id: instructor_id || null,
      day_of_week: day_of_week.toLowerCase(),
      start_time,
      end_time,
      capacity: capacity || 10,
      age_min: age_min || null,
      age_max: age_max || null,
      skill_level: skill_level || null,
      monthly_price: monthly_price ? parseFloat(monthly_price) : null
    });

    return NextResponse.json({
      success: true,
      message: 'Class created successfully',
      classId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Class creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 