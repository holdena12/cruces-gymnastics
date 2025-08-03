import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Database from 'better-sqlite3';
import path from 'path';
import { getSecurityHeaders, rateLimit, sanitizeInput, logSecurityEvent, createAuditLog } from '@/lib/security';

// Initialize database
const dbPath = path.join(process.cwd(), 'data', 'newsletter.db');
const db = new Database(dbPath);

// Create newsletter table
db.exec(`
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'active',
    subscribed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_date DATETIME,
    preferences TEXT, -- JSON string for email preferences
    verification_token TEXT,
    verified BOOLEAN DEFAULT 0,
    ip_address TEXT,
    user_agent TEXT
  )
`);

// Create newsletter campaigns table for future use
db.exec(`
  CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_date DATETIME,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Newsletter subscription schema
const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('website'),
  preferences: z.object({
    events: z.boolean().optional().default(true),
    promotions: z.boolean().optional().default(true),
    newsletters: z.boolean().optional().default(true),
    reminders: z.boolean().optional().default(true),
  }).optional()
});

// Newsletter operations
const newsletterOperations = {
  subscribe: (data: any) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO newsletter_subscribers 
      (email, source, preferences, ip_address, user_agent, verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.email,
      data.source || 'website',
      JSON.stringify(data.preferences || {}),
      data.ip_address,
      data.user_agent,
      data.verified || 0
    );
  },

  unsubscribe: (email: string) => {
    const stmt = db.prepare(`
      UPDATE newsletter_subscribers 
      SET status = 'unsubscribed', unsubscribed_date = datetime('now')
      WHERE email = ?
    `);
    return stmt.run(email);
  },

  getSubscriber: (email: string) => {
    const stmt = db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?');
    return stmt.get(email);
  },

  getAllSubscribers: (status = 'active') => {
    const stmt = db.prepare('SELECT * FROM newsletter_subscribers WHERE status = ? ORDER BY subscribed_date DESC');
    return stmt.all(status);
  },

  getStats: () => {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM newsletter_subscribers');
    const activeStmt = db.prepare('SELECT COUNT(*) as active FROM newsletter_subscribers WHERE status = "active"');
    const recentStmt = db.prepare(`
      SELECT COUNT(*) as recent 
      FROM newsletter_subscribers 
      WHERE subscribed_date >= datetime('now', '-30 days')
    `);
    
    const total = totalStmt.get() as { total: number };
    const active = activeStmt.get() as { active: number };
    const recent = recentStmt.get() as { recent: number };
    
    return {
      total: total.total,
      active: active.active,
      recent: recent.recent,
      unsubscribed: total.total - active.active
    };
  }
};

// Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 subscriptions per hour per IP
    const rateLimitResult = rateLimit(request, 5, 60 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many subscription attempts. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    // Sanitize email
    const sanitizedEmail = sanitizeInput(validatedData.email.toLowerCase().trim());

    // Get client information
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if already subscribed
    const existingSubscriber = newsletterOperations.getSubscriber(sanitizedEmail);
    
    if (existingSubscriber && existingSubscriber.status === 'active') {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        alreadySubscribed: true
      }, { headers: getSecurityHeaders() });
    }

    // Subscribe user
    const result = newsletterOperations.subscribe({
      email: sanitizedEmail,
      source: validatedData.source,
      preferences: validatedData.preferences,
      ip_address: ip,
      user_agent: userAgent,
      verified: 1 // Auto-verify for now, can implement email verification later
    });

    // Log subscription event
    logSecurityEvent(createAuditLog({
      action: 'NEWSLETTER_SUBSCRIPTION',
      resource: 'newsletter',
      details: { 
        email: sanitizedEmail,
        source: validatedData.source,
        ip: ip
      },
      success: true
    }));

    // Track with analytics if available
    if (process.env.NEXT_PUBLIC_GA_ID) {
      // This would be handled by the frontend gtag call
    }

    // Send welcome email (implement later with email service)
    // await sendWelcomeEmail(sanitizedEmail);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
      subscriber: {
        email: sanitizedEmail,
        subscribed_date: new Date().toISOString()
      }
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    logSecurityEvent(createAuditLog({
      action: 'NEWSLETTER_SUBSCRIPTION_ERROR',
      resource: 'newsletter',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address',
          details: error.errors 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token'); // For secure unsubscribe links

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Verify subscriber exists
    const subscriber = newsletterOperations.getSubscriber(sanitizedEmail);
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Email address not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Unsubscribe
    newsletterOperations.unsubscribe(sanitizedEmail);

    logSecurityEvent(createAuditLog({
      action: 'NEWSLETTER_UNSUBSCRIBE',
      resource: 'newsletter',
      details: { email: sanitizedEmail },
      success: true
    }));

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe. Please try again.' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Get newsletter statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    // Simple admin check - in production, implement proper admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const stats = newsletterOperations.getStats();
    const subscribers = newsletterOperations.getAllSubscribers();

    return NextResponse.json({
      success: true,
      stats,
      subscribers: subscribers.map((sub: any) => ({
        email: sub.email,
        source: sub.source,
        subscribed_date: sub.subscribed_date,
        status: sub.status
      }))
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter data' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export { newsletterOperations };