import { NextRequest, NextResponse } from 'next/server';
import { authOperations } from '@/lib/auth-database';
import { staffOperations } from '@/lib/database';

export async function POST(req: NextRequest) {
  console.log('--- Add Coach API Route ---');
  const token = req.cookies.get('auth-token')?.value;
  console.log('Token from cookie:', token ? `****** (length: ${token.length})` : 'Not found');

  if (!token) {
    console.error('Authorization failed: No token provided.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokenVerification = authOperations.verifyToken(token);
  console.log('Token verification result:', { 
    valid: tokenVerification.valid, 
    user: tokenVerification.user,
    error: tokenVerification.error 
  });

  if (!tokenVerification.valid || tokenVerification.user?.role !== 'admin') {
    console.error('Authorization failed: Token is invalid or user is not an admin.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, role, bio, specializations, certifications, hireDate, hourlyRate } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { success, user, error } = await authOperations.createUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role: 'coach',
    });

    if (!success || !user) {
      console.error('Error creating coach user:', error);
      let status = 500;
      if (error?.includes('exists')) {
        status = 409; // Conflict
      } else if (error?.includes('weak')) {
        status = 400; // Bad Request
      }
      return NextResponse.json({ error: error || 'Failed to create user' }, { status });
    }

    const staffData = {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      role,
      specializations: JSON.stringify(specializations),
      certifications: JSON.stringify(certifications),
      hire_date: hireDate,
      hourly_rate: hourlyRate,
      bio,
    };

    staffOperations.create(staffData);

    return NextResponse.json({ success: true, message: 'Coach created successfully' });
  } catch (error) {
    console.error('Error creating coach:', error);
    return NextResponse.json({ error: 'Failed to create coach' }, { status: 500 });
  }
} 