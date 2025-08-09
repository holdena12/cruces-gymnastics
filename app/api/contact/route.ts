import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contactOperations } from '@/lib/dynamodb-data';
import { getSecurityHeaders, rateLimit, sanitizeInput, logSecurityEvent, createAuditLog } from '@/lib/security';

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional().default('General Inquiry'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  childAge: z.string().optional(),
  experience: z.string().optional(),
  newsletter: z.boolean().optional().default(false),
  source: z.string().optional().default('website'),
  page: z.string().optional()
});

// Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 submissions per hour per IP
    const rateLimitResult = rateLimit(request, 3, 60 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many contact form submissions. Please try again later.' 
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
    const validatedData = contactSchema.parse(body);

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: sanitizeInput(validatedData.email.toLowerCase().trim()),
      phone: validatedData.phone ? sanitizeInput(validatedData.phone) : '',
      subject: sanitizeInput(validatedData.subject || 'General Inquiry'),
      message: sanitizeInput(validatedData.message),
      child_age: validatedData.childAge ? sanitizeInput(validatedData.childAge) : '',
      experience: validatedData.experience ? sanitizeInput(validatedData.experience) : '',
      newsletter_signup: validatedData.newsletter || false,
      source: validatedData.source || 'website',
      page: validatedData.page || ''
    };

    // Get client information
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create contact submission
    const result = await contactOperations.create({
      ...sanitizedData,
      ip_address: ip,
      user_agent: userAgent
    });

    // If newsletter signup requested, add to newsletter
    if (sanitizedData.newsletter_signup) {
      try {
        await fetch(`${request.url.split('/api/contact')[0]}/api/newsletter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: sanitizedData.email,
            source: 'contact_form'
          }),
        });
      } catch (error) {
        // Newsletter signup failed, but don't fail the contact form
        console.warn('Newsletter signup failed:', error);
      }
    }

    // Log contact submission
    logSecurityEvent(createAuditLog({
      action: 'CONTACT_FORM_SUBMISSION',
      resource: 'contact',
      details: { 
        contactId: result.lastInsertRowid,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        ip: ip
      },
      success: true
    }));

    // Send notification email to admin (implement with email service)
    // await sendAdminNotification(sanitizedData, result.lastInsertRowid);

    // Send auto-response to user (implement with email service)
    // await sendAutoResponse(sanitizedData);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      contactId: result.lastInsertRowid
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Contact form submission error:', error);

    logSecurityEvent(createAuditLog({
      action: 'CONTACT_FORM_ERROR',
      resource: 'contact',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    }));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please check your information and try again.',
          details: (error as any).issues || [] 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form. Please try again.' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Get contact submissions (admin only)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeStats = searchParams.get('stats') === 'true';

    const contacts = await contactOperations.getAll(status || undefined);
    
    const response: any = {
      success: true,
      contacts: contacts.map((contact: any) => ({
        ...contact,
        newsletter_signup: Boolean(contact.newsletter_signup),
        response_sent: Boolean(contact.response_sent)
      }))
    };

    if (includeStats) {
      response.stats = await contactOperations.getStats();
      response.subjectStats = await contactOperations.getSubjectStats();
    }

    return NextResponse.json(response, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Contact submissions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact submissions' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Update contact status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Simple admin check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const { id, status, assignedTo, markResponseSent, responderName } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Contact ID and status are required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Update status
    await contactOperations.updateStatus(id, status, assignedTo);

    // Mark response sent if requested
    if (markResponseSent && responderName) {
      await contactOperations.markResponseSent(id, responderName);
    }

    logSecurityEvent(createAuditLog({
      action: 'CONTACT_STATUS_UPDATE',
      resource: 'contact',
      details: { 
        contactId: id,
        newStatus: status,
        assignedTo,
        responseSent: markResponseSent
      },
      success: true
    }));

    return NextResponse.json({
      success: true,
      message: 'Contact status updated successfully'
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Contact status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact status' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export { contactOperations };