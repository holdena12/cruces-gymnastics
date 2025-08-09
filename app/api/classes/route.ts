import { NextRequest, NextResponse } from 'next/server';
import { classOperations } from '@/lib/dynamodb-data';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';

// Helper function to verify admin
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  
  const authResult = await authOperations.verifyToken(token);
  if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') return null;

  return authResult.user;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const day = url.searchParams.get('day');
    const id = url.searchParams.get('id');

    let classes;
    if (id) {
      classes = await classOperations.getById(parseInt(id));
    } else if (day) {
      classes = await classOperations.getByDay(day);
    } else {
      classes = await classOperations.getAll();
    }

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Classes fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, program_type, instructor_id, day_of_week, start_time, end_time, 
            capacity, age_min, age_max, skill_level, monthly_price } = body;

    if (!name || !program_type || !day_of_week || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, error: 'Name, program type, day, start time, and end time are required' },
        { status: 400 }
      );
    }

    const result = await classOperations.create({
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
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, classId, studentId } = body;

    if (action === 'enroll') {
      // Check capacity before enrolling
      const currentCount = await classOperations.getEnrollmentCount(classId);
      const classInfo = await classOperations.getById(classId) as any;
      
      if (classInfo && currentCount >= classInfo.capacity) {
        return NextResponse.json(
          { success: false, error: 'Class is at full capacity' },
          { status: 400 }
        );
      }

      await classOperations.enrollStudent(studentId, classId);
      return NextResponse.json({
        success: true,
        message: 'Student enrolled in class successfully'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Class update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 