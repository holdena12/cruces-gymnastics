import { NextRequest, NextResponse } from 'next/server';
import { staffOperations } from '@/lib/database';
import { authOperations } from '@/lib/auth-database';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenVerification = authOperations.verifyToken(token);

    if (!tokenVerification.valid || tokenVerification.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const staff = staffOperations.getAll();
        return NextResponse.json({ staff });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
} 