import { NextRequest, NextResponse } from 'next/server';
import { staffOperations } from '@/lib/dynamodb-data';
import { dynamoAuthOperations as authOperations } from '@/lib/dynamodb-auth';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenVerification = await authOperations.verifyToken(token);

    if (!tokenVerification.valid || tokenVerification.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const staff = await staffOperations.getAll();
        return NextResponse.json({ staff });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
} 