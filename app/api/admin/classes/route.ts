import { NextRequest, NextResponse } from 'next/server';
import { classOperations } from '@/lib/dynamodb-data';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';

// No direct DB connection needed with DynamoDB layer

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const result = await authOperations.verifyToken(token);
  if (!result.valid || !result.user || result.user.role !== 'admin') {
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
    const classes = await classOperations.getAll();
    
    // Enrollment details per class would require a GSI/secondary index or modeled relation items.
    // For now, return classes without join details to keep parity at list level.
    const classesWithEnrollments = classes.map((classItem: any) => ({
      ...classItem,
      enrolled_students: [],
      enrollment_count: 0,
      available_spots: classItem.capacity,
    }));

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
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 