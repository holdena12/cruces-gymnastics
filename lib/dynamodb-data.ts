import { dynamoOperations, generateId, formatTimestamp } from './dynamodb-client';
import { EnrollmentItem, ClassItem, PaymentItem, StaffItem } from './dynamodb-schema';
import { encryptSensitiveData, decryptSensitiveData, sanitizeInput } from './security';

// Align with the existing type used by routes
export interface EnrollmentData {
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth?: string;
  student_gender?: string;
  previous_experience?: string;
  program_type: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  address: string;
  city: string;
  state?: string;
  zip_code: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  emergency_contact_alt_phone?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  physician_name?: string;
  physician_phone?: string;
  payment_method: string;
  terms_accepted: boolean;
  photo_permission?: boolean;
  email_updates?: boolean;
  signature_name: string;
  signature_date: string;
}

function toEnrollmentItem(data: EnrollmentData): EnrollmentItem {
  const id = Date.now().toString();
  return {
    PK: `ENROLLMENT#${id}`,
    SK: `ENROLLMENT#${id}`,
    id,
    studentFirstName: sanitizeInput(data.student_first_name),
    studentLastName: sanitizeInput(data.student_last_name),
    studentDateOfBirth: data.student_date_of_birth,
    studentGender: data.student_gender ? sanitizeInput(data.student_gender) : undefined,
    previousExperience: data.previous_experience ? sanitizeInput(data.previous_experience) : undefined,
    programType: data.program_type,
    parentFirstName: sanitizeInput(data.parent_first_name),
    parentLastName: sanitizeInput(data.parent_last_name),
    parentEmail: sanitizeInput(data.parent_email.toLowerCase()),
    parentPhone: sanitizeInput(data.parent_phone),
    address: sanitizeInput(data.address),
    city: sanitizeInput(data.city),
    state: data.state ? sanitizeInput(data.state) : undefined,
    zipCode: sanitizeInput(data.zip_code),
    emergencyContactName: sanitizeInput(data.emergency_contact_name),
    emergencyContactRelationship: sanitizeInput(data.emergency_contact_relationship),
    emergencyContactPhone: sanitizeInput(data.emergency_contact_phone),
    emergencyContactAltPhone: data.emergency_contact_alt_phone ? sanitizeInput(data.emergency_contact_alt_phone) : undefined,
    allergies: data.allergies ? encryptSensitiveData(sanitizeInput(data.allergies)) : undefined,
    medicalConditions: data.medical_conditions ? encryptSensitiveData(sanitizeInput(data.medical_conditions)) : undefined,
    medications: data.medications ? encryptSensitiveData(sanitizeInput(data.medications)) : undefined,
    physicianName: data.physician_name ? encryptSensitiveData(sanitizeInput(data.physician_name)) : undefined,
    physicianPhone: data.physician_phone ? encryptSensitiveData(sanitizeInput(data.physician_phone)) : undefined,
    paymentMethod: data.payment_method,
    termsAccepted: data.terms_accepted,
    photoPermission: data.photo_permission || false,
    emailUpdates: data.email_updates || false,
    signatureName: sanitizeInput(data.signature_name),
    signatureDate: data.signature_date,
    status: 'pending',
    submissionDate: formatTimestamp(),
  } as EnrollmentItem;
}

function enrollmentItemToResponse(item: EnrollmentItem) {
  return {
    id: parseInt(item.id, 10),
    student_first_name: item.studentFirstName,
    student_last_name: item.studentLastName,
    student_date_of_birth: item.studentDateOfBirth,
    student_gender: item.studentGender,
    previous_experience: item.previousExperience,
    program_type: item.programType,
    parent_first_name: item.parentFirstName,
    parent_last_name: item.parentLastName,
    parent_email: item.parentEmail,
    parent_phone: item.parentPhone,
    address: item.address,
    city: item.city,
    state: item.state,
    zip_code: item.zipCode,
    emergency_contact_name: item.emergencyContactName,
    emergency_contact_relationship: item.emergencyContactRelationship,
    emergency_contact_phone: item.emergencyContactPhone,
    emergency_contact_alt_phone: item.emergencyContactAltPhone,
    allergies: item.allergies ? decryptSensitiveData(item.allergies) : item.allergies,
    medical_conditions: item.medicalConditions ? decryptSensitiveData(item.medicalConditions) : item.medicalConditions,
    medications: item.medications ? decryptSensitiveData(item.medications) : item.medications,
    physician_name: item.physicianName ? decryptSensitiveData(item.physicianName) : item.physicianName,
    physician_phone: item.physicianPhone ? decryptSensitiveData(item.physicianPhone) : item.physicianPhone,
    payment_method: item.paymentMethod,
    terms_accepted: item.termsAccepted,
    photo_permission: item.photoPermission,
    email_updates: item.emailUpdates,
    signature_name: item.signatureName,
    signature_date: item.signatureDate,
    submission_date: item.submissionDate,
    status: item.status,
  };
}

export const enrollmentOperations = {
  create: async (data: EnrollmentData) => {
    const item = toEnrollmentItem(data);
    const result = await dynamoOperations.put(item);
    if (!result.success) {
      throw new Error('Failed to create enrollment');
    }
    return { changes: 1, lastInsertRowid: parseInt(item.id, 10) };
  },
  
  getAll: async () => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk)', { ':pk': 'ENROLLMENT#' });
    if (!scan.success) throw new Error('Failed to fetch enrollments');
    return (scan.items as EnrollmentItem[]).map(enrollmentItemToResponse).sort((a, b) => (a.submission_date > b.submission_date ? -1 : 1));
  },
  
  getById: async (id: number) => {
    const pk = `ENROLLMENT#${id}`;
    const res = await dynamoOperations.get(pk, pk);
    if (!res.success || !res.item) return null;
    return enrollmentItemToResponse(res.item as EnrollmentItem);
  },
  
  getByEmail: async (email: string) => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk) AND parentEmail = :email', { ':pk': 'ENROLLMENT#', ':email': email });
    if (!scan.success) return [];
    return (scan.items as EnrollmentItem[]).map(enrollmentItemToResponse);
  },
  
  updateStatus: async (id: number, status: string) => {
    const key = `ENROLLMENT#${id}`;
    return dynamoOperations.update(key, key, 'SET #status = :status', { ':status': status }, { '#status': 'status' });
  },
  
  delete: async (id: number) => {
    const key = `ENROLLMENT#${id}`;
    const res = await dynamoOperations.delete(key, key);
    return { changes: res.success ? 1 : 0 };
  },
};

export const classOperations = {
  create: async (data: any) => {
    const id = Date.now().toString();
    const item: ClassItem = {
      PK: `CLASS#${id}`,
      SK: `CLASS#${id}`,
      id,
      name: data.name,
      programType: data.program_type,
      instructorId: data.instructor_id ? String(data.instructor_id) : undefined,
      dayOfWeek: data.day_of_week || '',
      startTime: data.start_time || '',
      endTime: data.end_time || '',
      capacity: data.capacity ?? 10,
      ageMin: data.age_min ?? undefined,
      ageMax: data.age_max ?? undefined,
      skillLevel: data.skill_level ?? undefined,
      monthlyPrice: data.monthly_price ?? undefined,
      isActive: true,
      createdAt: formatTimestamp(),
    };
    const result = await dynamoOperations.put(item);
    if (!result.success) throw new Error('Failed to create class');
    return { lastInsertRowid: parseInt(id, 10) };
  },

  getAll: async () => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk) AND isActive = :active', { ':pk': 'CLASS#', ':active': true });
    if (!scan.success) throw new Error('Failed to fetch classes');
    return (scan.items as ClassItem[]).map((c) => ({
      id: parseInt(c.id, 10),
      name: c.name,
      program_type: c.programType,
      instructor_id: c.instructorId ? parseInt(c.instructorId, 10) : null,
      day_of_week: c.dayOfWeek,
      start_time: c.startTime,
      end_time: c.endTime,
      capacity: c.capacity,
      age_min: c.ageMin ?? null,
      age_max: c.ageMax ?? null,
      skill_level: c.skillLevel ?? null,
      monthly_price: c.monthlyPrice ?? null,
      active: c.isActive,
      created_at: c.createdAt,
    }));
  },

  getById: async (id: number) => {
    const key = `CLASS#${id}`;
    const res = await dynamoOperations.get(key, key);
    const c = res.item as ClassItem | undefined;
    if (!c) return null;
    return {
      id: parseInt(c.id, 10),
      name: c.name,
      program_type: c.programType,
      instructor_id: c.instructorId ? parseInt(c.instructorId, 10) : null,
      day_of_week: c.dayOfWeek,
      start_time: c.startTime,
      end_time: c.endTime,
      capacity: c.capacity,
      age_min: c.ageMin ?? null,
      age_max: c.ageMax ?? null,
      skill_level: c.skillLevel ?? null,
      monthly_price: c.monthlyPrice ?? null,
      active: c.isActive,
      created_at: c.createdAt,
    };
  },

  getByDay: async (day: string) => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk) AND dayOfWeek = :day AND isActive = :active', { ':pk': 'CLASS#', ':day': day.toLowerCase(), ':active': true });
    if (!scan.success) return [];
    return (scan.items as ClassItem[]).map((c) => ({
      id: parseInt(c.id, 10),
      name: c.name,
      program_type: c.programType,
      instructor_id: c.instructorId ? parseInt(c.instructorId, 10) : null,
      day_of_week: c.dayOfWeek,
      start_time: c.startTime,
      end_time: c.endTime,
      capacity: c.capacity,
      age_min: c.ageMin ?? null,
      age_max: c.ageMax ?? null,
      skill_level: c.skillLevel ?? null,
      monthly_price: c.monthlyPrice ?? null,
      active: c.isActive,
      created_at: c.createdAt,
    }));
  },

  enrollStudent: async (studentId: number, classId: number) => {
    // Store a relation item under the class partition
    const item = {
      PK: `CLASS#${classId}`,
      SK: `ENROLLMENT#${studentId}`,
      classId: String(classId),
      enrollmentId: String(studentId),
      enrollment_date: formatTimestamp(),
      status: 'active',
      entityType: 'CLASS_ENROLLMENT',
    } as any;
    await dynamoOperations.put(item);
    return { success: true };
  },

  getEnrollmentCount: async (classId: number) => {
    const q = await dynamoOperations.query(`CLASS#${classId}`);
    if (!q.success) return 0;
    return (q.items || []).filter((it: any) => it.SK?.startsWith('ENROLLMENT#') && it.status === 'active').length;
  },
};

export const paymentOperations = {
  create: async (data: any) => {
    const id = Date.now().toString();
    const item: PaymentItem = {
      PK: `PAYMENT#${id}`,
      SK: `PAYMENT#${id}`,
      id,
      enrollmentId: String(data.enrollment_id),
      amount: data.amount,
      paymentType: data.payment_type,
      description: data.description,
      customerEmail: data.parent_email,
      status: data.payment_status || 'pending',
      stripePaymentIntentId: data.stripe_payment_intent_id,
      createdAt: formatTimestamp(),
      notes: data.notes,
    } as PaymentItem;
    const result = await dynamoOperations.put(item);
    if (!result.success) throw new Error('Failed to create payment');
    return { lastInsertRowid: parseInt(id, 10) };
  },

  updateStatus: async (id: number | string, status: string, additionalData: any = {}) => {
    const key = `PAYMENT#${id}`;
    const names: Record<string, string> = { '#status': 'status' };
    const values: Record<string, any> = { ':status': status };
    let update = 'SET #status = :status';

    if (additionalData.paid_date) {
      update += ', completedAt = :paidDate';
      values[':paidDate'] = additionalData.paid_date;
    }
    if (additionalData.failure_reason) {
      update += ', notes = :failureReason';
      values[':failureReason'] = additionalData.failure_reason;
    }
    if (additionalData.receipt_url) {
      update += ', receiptUrl = :receiptUrl';
      values[':receiptUrl'] = additionalData.receipt_url;
    }
    if (additionalData.stripe_payment_method_id) {
      update += ', stripePaymentMethodId = :spmId';
      values[':spmId'] = additionalData.stripe_payment_method_id;
    }

    await dynamoOperations.update(key, key, update, values, names);
    return { success: true };
  },

  getById: async (id: number) => {
    const key = `PAYMENT#${id}`;
    const res = await dynamoOperations.get(key, key);
    return res.item as PaymentItem | null;
  },

  getByEnrollmentId: async (enrollmentId: number) => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk) AND enrollmentId = :enr', { ':pk': 'PAYMENT#', ':enr': String(enrollmentId) });
    if (!scan.success) return [];
    return scan.items as PaymentItem[];
  },

  getByStripePaymentIntentId: async (paymentIntentId: string) => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk) AND stripePaymentIntentId = :pi', { ':pk': 'PAYMENT#', ':pi': paymentIntentId });
    if (!scan.success) return null;
    return (scan.items as PaymentItem[])[0] || null;
  },
};

export const staffOperations = {
  create: async (data: any) => {
    const id = Date.now().toString();
    const item: StaffItem = {
      PK: `STAFF#${id}`,
      SK: `STAFF#${id}`,
      id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      specialties: data.specializations ? JSON.parse(data.specializations) : undefined,
      certifications: data.certifications ? JSON.parse(data.certifications) : undefined,
      isActive: true,
      hireDate: data.hire_date || formatTimestamp(),
      bio: data.bio,
    } as StaffItem;
    await dynamoOperations.put(item);
    return { lastInsertRowid: parseInt(id, 10) };
  },

  getAll: async () => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk) AND isActive = :active', { ':pk': 'STAFF#', ':active': true });
    if (!scan.success) return [];
    return (scan.items as StaffItem[]).map((s) => ({
      id: parseInt(s.id, 10),
      first_name: s.firstName,
      last_name: s.lastName,
      email: s.email,
      phone: s.phone,
      role: s.role,
      specializations: s.specialties,
      certifications: s.certifications,
      hire_date: s.hireDate,
      active: s.isActive,
      bio: s.bio,
    }));
  },
};

// Contact Operations (DynamoDB)
export const contactOperations = {
  create: async (data: any) => {
    const id = Date.now().toString();
    const item = {
      PK: `CONTACT#${id}`,
      SK: `CONTACT#${id}`,
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      child_age: data.child_age,
      experience: data.experience,
      newsletter_signup: data.newsletter_signup ? 1 : 0,
      source: data.source,
      page: data.page,
      status: 'new',
      priority: 'normal',
      assigned_to: null,
      response_sent: 0,
      response_date: null,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      created_at: formatTimestamp(),
      updated_at: formatTimestamp(),
    };
    const res = await dynamoOperations.put(item);
    if (!res.success) throw new Error('Failed to save contact');
    return { lastInsertRowid: parseInt(id, 10) };
  },

  getById: async (id: number) => {
    const key = `CONTACT#${id}`;
    const res = await dynamoOperations.get(key, key);
    return res.item || null;
  },

  getAll: async (status?: string) => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk)' + (status ? ' AND #status = :status' : ''), { ':pk': 'CONTACT#', ...(status ? { ':status': status } : {}) });
    const items = (scan.items || []) as any[];
    return items
      .filter((it) => !status || it.status === status)
      .sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  },

  updateStatus: async (id: number, status: string, assignedTo?: string) => {
    const key = `CONTACT#${id}`;
    const update = 'SET #status = :status, assigned_to = :assignedTo, updated_at = :updatedAt';
    const values = { ':status': status, ':assignedTo': assignedTo || null, ':updatedAt': formatTimestamp() } as Record<string, any>;
    const names = { '#status': 'status' } as Record<string, string>;
    await dynamoOperations.update(key, key, update, values, names);
    return { success: true };
  },

  markResponseSent: async (id: number, responderName: string) => {
    const key = `CONTACT#${id}`;
    const update = 'SET response_sent = :sent, response_date = :date, updated_at = :updatedAt';
    await dynamoOperations.update(key, key, update, { ':sent': 1, ':date': formatTimestamp(), ':updatedAt': formatTimestamp() }, {});
    return { success: true };
  },

  getStats: async () => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk)', { ':pk': 'CONTACT#' });
    const items = (scan.items || []) as any[];
    const total = items.length;
    const newCount = items.filter((c) => c.status === 'new').length;
    const inProgress = items.filter((c) => c.status === 'in_progress').length;
    const recent = items.filter((c) => new Date(c.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    return { total, new: newCount, in_progress: inProgress, completed: total - newCount - inProgress, recent };
  },

  getSubjectStats: async () => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk)', { ':pk': 'CONTACT#' });
    const items = (scan.items || []) as any[];
    const nowMinus30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = items.filter((c) => new Date(c.created_at).getTime() >= nowMinus30);
    const map = new Map<string, number>();
    for (const c of recent) {
      const s = c.subject || 'General Inquiry';
      map.set(s, (map.get(s) || 0) + 1);
    }
    return Array.from(map.entries()).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count);
  },
};

// Newsletter Operations (DynamoDB)
export const newsletterOperations = {
  subscribe: async (data: any) => {
    const email = data.email;
    const item = {
      PK: `NEWSLETTER#${email}`,
      SK: `SUBSCRIBER#${email}`,
      email,
      source: data.source || 'website',
      status: 'active',
      subscribed_date: formatTimestamp(),
      unsubscribed_date: null,
      preferences: JSON.stringify(data.preferences || {}),
      verification_token: null,
      verified: data.verified || 1,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    };
    const res = await dynamoOperations.put(item);
    if (!res.success) throw new Error('Failed to subscribe');
    return { lastInsertRowid: email };
  },

  unsubscribe: async (email: string) => {
    const key = `NEWSLETTER#${email}`;
    await dynamoOperations.update(key, `SUBSCRIBER#${email}`, 'SET #status = :status, unsubscribed_date = :date', { ':status': 'unsubscribed', ':date': formatTimestamp() }, { '#status': 'status' });
    return { success: true };
  },

  getSubscriber: async (email: string) => {
    const res = await dynamoOperations.get(`NEWSLETTER#${email}`, `SUBSCRIBER#${email}`);
    return res.item || null;
  },

  getAllSubscribers: async (status = 'active') => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk)', { ':pk': 'NEWSLETTER#' });
    const items = (scan.items || []) as any[];
    return items.filter((it) => it.status === status).sort((a, b) => (a.subscribed_date > b.subscribed_date ? -1 : 1));
  },

  getStats: async () => {
    const scan = await dynamoOperations.scan('begins_with(PK, :pk)', { ':pk': 'NEWSLETTER#' });
    const items = (scan.items || []) as any[];
    const total = items.length;
    const active = items.filter((s) => s.status === 'active').length;
    const recent = items.filter((s) => new Date(s.subscribed_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    return { total, active, recent, unsubscribed: total - active };
  },
}; 