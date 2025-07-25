import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { join } from 'path';
import { validatePasswordStrength, logSecurityEvent, createAuditLog } from './security';

const dbPath = join(process.cwd(), 'auth.db');
const authDb = new Database(dbPath);

// Enhanced JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h'; // Reduced from 7 days for better security
const BCRYPT_ROUNDS = 12; // High security hashing

// Create the users table if it doesn't exist
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )
`;

// Create sessions table for better session management
const createSessionsTable = `
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`;

// Create admin invitations table
const createAdminInvitationsTable = `
  CREATE TABLE IF NOT EXISTS admin_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    invited_by INTEGER NOT NULL,
    invitation_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE CASCADE
  )
`;

// Create admin audit log table
const createAdminAuditTable = `
  CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_user_id INTEGER,
    target_email TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE SET NULL
  )
`;

// Create admin approval requests table (for multi-admin approval)
const createAdminApprovalsTable = `
  CREATE TABLE IF NOT EXISTS admin_approval_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requested_by INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER,
    approved_at DATETIME,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
  )
`;

// Initialize the authentication database
try {
  authDb.exec(createUsersTable);
  authDb.exec(createSessionsTable);
  authDb.exec(createAdminInvitationsTable);
  authDb.exec(createAdminAuditTable);
  authDb.exec(createAdminApprovalsTable);
  
  // Create default admin user if it doesn't exist - with environment-based credentials
  const adminExists = authDb.prepare('SELECT id FROM users WHERE email = ?').get(process.env.ADMIN_EMAIL || 'admin@crucesgymnastics.com');
  if (!adminExists) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'TempAdmin123!';
    const hashedPassword = bcrypt.hashSync(adminPassword, 12);
    const result = authDb.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      process.env.ADMIN_EMAIL || 'admin@crucesgymnastics.com', 
      hashedPassword, 
      'System', 
      'Administrator', 
      'admin'
    );
    
    // Log admin creation
    authDb.prepare(`
      INSERT INTO admin_audit_log (admin_id, action, target_email, details)
      VALUES (?, ?, ?, ?)
    `).run(result.lastInsertRowid, 'ADMIN_CREATED', process.env.ADMIN_EMAIL || 'admin@crucesgymnastics.com', 'Initial system admin created');
    
    console.log(`Default admin user created: ${process.env.ADMIN_EMAIL || 'admin@crucesgymnastics.com'}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('⚠️  SECURITY WARNING: Using default admin password. Set ADMIN_PASSWORD environment variable!');
    }
  }
  
  console.log('Authentication database initialized successfully');
} catch (error) {
  console.error('Error initializing authentication database:', error);
}

// User interface
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'user' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Authentication operations
export const authOperations = {
  // Create new user
  createUser: async (data: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.valid) {
        logSecurityEvent(createAuditLog({
          action: 'USER_CREATION_FAILED',
          resource: 'users',
          details: { email: data.email, reason: 'weak_password' },
          success: false
        }));
        return { success: false, error: `Password too weak: ${passwordValidation.errors.join(', ')}` };
      }

      // Check if user already exists
      const existingUser = authDb.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
      if (existingUser) {
        logSecurityEvent(createAuditLog({
          action: 'USER_CREATION_FAILED',
          resource: 'users',
          details: { email: data.email, reason: 'email_exists' },
          success: false
        }));
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password with enhanced security
      const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

      // Insert user
      const stmt = authDb.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.email.toLowerCase().trim(),
        hashedPassword,
        data.first_name.trim(),
        data.last_name.trim(),
        data.role || 'user'
      );

      // Get the created user
      const user = authDb.prepare(`
        SELECT id, email, first_name, last_name, role, is_active, created_at
        FROM users WHERE id = ?
      `).get(result.lastInsertRowid) as User;

      // Log successful user creation
      logSecurityEvent(createAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: 'USER_CREATED',
        resource: 'users',
        details: { role: user.role },
        success: true
      }));

      return { success: true, user };
    } catch (error) {
      console.error('Error creating user:', error);
      logSecurityEvent(createAuditLog({
        action: 'USER_CREATION_ERROR',
        resource: 'users',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      }));
      return { success: false, error: 'Failed to create user' };
    }
  },

  // Authenticate user
  login: async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; token?: string; error?: string }> => {
    try {
      // Get user by email
      const user = authDb.prepare(`
        SELECT id, email, password_hash, first_name, last_name, role, is_active
        FROM users WHERE email = ? AND is_active = 1
      `).get(credentials.email.toLowerCase().trim()) as any;

      if (!user) {
        logSecurityEvent(createAuditLog({
          action: 'LOGIN_FAILED',
          resource: 'authentication',
          details: { email: credentials.email, reason: 'user_not_found' },
          success: false
        }));
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isValidPassword) {
        logSecurityEvent(createAuditLog({
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN_FAILED',
          resource: 'authentication',
          details: { reason: 'invalid_password' },
          success: false
        }));
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      authDb.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

      // Create JWT token with enhanced security
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomBytes(16).toString('hex') // Unique token ID
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store session with expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours for security

      authDb.prepare(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `).run(user.id, token, expiresAt.toISOString());

      const userResponse: User = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      };

      // Log successful login
      logSecurityEvent(createAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN_SUCCESS',
        resource: 'authentication',
        details: { role: user.role },
        success: true
      }));

      return { success: true, user: userResponse, token };
    } catch (error) {
      console.error('Error during login:', error);
      logSecurityEvent(createAuditLog({
        action: 'LOGIN_ERROR',
        resource: 'authentication',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      }));
      return { success: false, error: 'Login failed' };
    }
  },

  // Verify JWT token
  verifyToken: (token: string): { valid: boolean; user?: any; error?: string } => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if session exists and is valid
      const session = authDb.prepare(`
        SELECT s.*, u.email, u.first_name, u.last_name, u.role, u.is_active
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1
      `).get(token) as any;

      if (!session) {
        return { valid: false, error: 'Invalid or expired session' };
      }

      return { 
        valid: true, 
        user: {
          id: session.user_id,
          email: session.email,
          first_name: session.first_name,
          last_name: session.last_name,
          role: session.role
        }
      };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  },

  // Logout (invalidate session)
  logout: (token: string): boolean => {
    try {
      authDb.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  },

  // Get all users (admin only)
  getAllUsers: (): User[] => {
    return authDb.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
      FROM users ORDER BY created_at DESC
    `).all() as User[];
  },

  // Get user by ID
  getUserById: (id: number): User | null => {
    return authDb.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
      FROM users WHERE id = ?
    `).get(id) as User | null;
  },

  // Update user role (admin only)
  updateUserRole: (userId: number, role: 'user' | 'admin'): boolean => {
    try {
      const result = authDb.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  },

  // Deactivate user (admin only)
  deactivateUser: (userId: number): boolean => {
    try {
      // Don't allow deactivating the last admin
      const adminCount = authDb.prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = 1').get() as { count: number };
      const userToDeactivate = authDb.prepare('SELECT role FROM users WHERE id = ?').get(userId) as { role: string } | undefined;
      
      if (userToDeactivate?.role === 'admin' && adminCount.count <= 1) {
        return false; // Can't deactivate the last admin
      }

      const result = authDb.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(userId);
      // Also invalidate all sessions for this user
      authDb.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  },

  // Activate user (admin only)
  activateUser: (userId: number): boolean => {
    try {
      const result = authDb.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error activating user:', error);
      return false;
    }
  },

  // Cleanup expired sessions
  cleanupExpiredSessions: (): number => {
    try {
      const result = authDb.prepare('DELETE FROM sessions WHERE expires_at <= datetime("now")').run();
      return result.changes;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  },

  // Secure admin invitation system
  inviteAdmin: async (data: {
    email: string;
    invitedByAdminId: number;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; invitation?: any; error?: string }> => {
    try {
      // Check if inviter is admin
      const inviter = authDb.prepare('SELECT id, email, role FROM users WHERE id = ? AND role = "admin" AND is_active = 1').get(data.invitedByAdminId);
      if (!inviter) {
        return { success: false, error: 'Only active admins can invite new admins' };
      }

      // Check if user already exists
      const existingUser = authDb.prepare('SELECT id, role FROM users WHERE email = ?').get(data.email.toLowerCase()) as { id: number; role: string } | undefined;
      if (existingUser) {
        if (existingUser.role === 'admin') {
          return { success: false, error: 'User is already an admin' };
        }
        // If regular user exists, we'll upgrade them after verification
      }

      // Check for existing pending invitation
      const existingInvitation = authDb.prepare(`
        SELECT id FROM admin_invitations 
        WHERE email = ? AND used_at IS NULL AND expires_at > datetime('now')
      `).get(data.email.toLowerCase());
      
      if (existingInvitation) {
        return { success: false, error: 'Active invitation already exists for this email' };
      }

      // Generate invitation token
      const invitationToken = jwt.sign(
        { email: data.email, type: 'admin_invitation' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invitation
      const result = authDb.prepare(`
        INSERT INTO admin_invitations (email, invited_by, invitation_token, expires_at)
        VALUES (?, ?, ?, ?)
      `).run(data.email.toLowerCase(), data.invitedByAdminId, invitationToken, expiresAt.toISOString());

      // Log the invitation
      authDb.prepare(`
        INSERT INTO admin_audit_log (admin_id, action, target_email, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        data.invitedByAdminId,
        'ADMIN_INVITED',
        data.email,
        data.reason || 'Admin invitation sent',
        data.ipAddress,
        data.userAgent
      );

      const invitation = {
        id: result.lastInsertRowid,
        email: data.email,
        token: invitationToken,
        expiresAt: expiresAt.toISOString()
      };

      return { success: true, invitation };
    } catch (error) {
      console.error('Error creating admin invitation:', error);
      return { success: false, error: 'Failed to create admin invitation' };
    }
  },

  // Accept admin invitation
  acceptAdminInvitation: async (data: {
    token: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Verify invitation token
      const decoded = jwt.verify(data.token, JWT_SECRET) as any;
      if (decoded.type !== 'admin_invitation') {
        return { success: false, error: 'Invalid invitation token' };
      }

      // Get invitation details
      const invitation = authDb.prepare(`
        SELECT * FROM admin_invitations 
        WHERE invitation_token = ? AND used_at IS NULL AND expires_at > datetime('now')
      `).get(data.token) as { id: number; email: string; invited_by: number } | undefined;

      if (!invitation) {
        return { success: false, error: 'Invalid or expired invitation' };
      }

      // Check if user already exists
      const existingUser = authDb.prepare('SELECT * FROM users WHERE email = ?').get(invitation.email) as { id: number; email: string } | undefined;
      
      let userId: number;
      
      if (existingUser) {
        // Upgrade existing user to admin
        authDb.prepare('UPDATE users SET role = "admin" WHERE id = ?').run(existingUser.id);
        userId = existingUser.id;
      } else {
        // Create new admin user
        if (!data.password || !data.firstName || !data.lastName) {
          return { success: false, error: 'Password, first name, and last name are required for new users' };
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const result = authDb.prepare(`
          INSERT INTO users (email, password_hash, first_name, last_name, role)
          VALUES (?, ?, ?, ?, 'admin')
        `).run(invitation.email, hashedPassword, data.firstName, data.lastName);
        userId = result.lastInsertRowid as number;
      }

      // Mark invitation as used
      authDb.prepare('UPDATE admin_invitations SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(invitation.id);

      // Log the admin acceptance
      authDb.prepare(`
        INSERT INTO admin_audit_log (admin_id, action, target_user_id, target_email, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        invitation.invited_by,
        'ADMIN_INVITATION_ACCEPTED',
        userId,
        invitation.email,
        'Admin invitation accepted',
        data.ipAddress,
        data.userAgent
      );

      // Get the user data
      const user = authDb.prepare(`
        SELECT id, email, first_name, last_name, role, is_active, created_at
        FROM users WHERE id = ?
      `).get(userId) as User;

      return { success: true, user };
    } catch (error) {
      console.error('Error accepting admin invitation:', error);
      return { success: false, error: 'Failed to accept admin invitation' };
    }
  },

  // Request admin promotion (requires approval)
  requestAdminPromotion: async (data: {
    targetUserId: number;
    requestedByAdminId: number;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; requestId?: number; error?: string }> => {
    try {
      // Verify requester is admin
      const requester = authDb.prepare('SELECT id FROM users WHERE id = ? AND role = "admin" AND is_active = 1').get(data.requestedByAdminId);
      if (!requester) {
        return { success: false, error: 'Only admins can request promotions' };
      }

      // Verify target user exists and is not already admin
      const targetUser = authDb.prepare('SELECT id, email, role FROM users WHERE id = ? AND is_active = 1').get(data.targetUserId) as { id: number; email: string; role: string } | undefined;
      if (!targetUser) {
        return { success: false, error: 'Target user not found or inactive' };
      }
      if (targetUser.role === 'admin') {
        return { success: false, error: 'User is already an admin' };
      }

      // Check for existing pending request
      const existingRequest = authDb.prepare(`
        SELECT id FROM admin_approval_requests 
        WHERE target_user_id = ? AND status = 'pending' AND expires_at > datetime('now')
      `).get(data.targetUserId);

      if (existingRequest) {
        return { success: false, error: 'Pending promotion request already exists for this user' };
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // 3 days to approve

      // Create approval request
      const result = authDb.prepare(`
        INSERT INTO admin_approval_requests (requested_by, target_user_id, action, reason, expires_at)
        VALUES (?, ?, 'PROMOTE_TO_ADMIN', ?, ?)
      `).run(data.requestedByAdminId, data.targetUserId, data.reason, expiresAt.toISOString());

      // Log the request
      authDb.prepare(`
        INSERT INTO admin_audit_log (admin_id, action, target_user_id, target_email, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.requestedByAdminId,
        'ADMIN_PROMOTION_REQUESTED',
        data.targetUserId,
        targetUser.email,
        data.reason,
        data.ipAddress,
        data.userAgent
      );

      return { success: true, requestId: result.lastInsertRowid as number };
    } catch (error) {
      console.error('Error requesting admin promotion:', error);
      return { success: false, error: 'Failed to create promotion request' };
    }
  },

  // Approve admin promotion request
  approveAdminPromotion: async (data: {
    requestId: number;
    approvingAdminId: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get the request
      const request = authDb.prepare(`
        SELECT ar.*, u.email as target_email 
        FROM admin_approval_requests ar
        JOIN users u ON ar.target_user_id = u.id
        WHERE ar.id = ? AND ar.status = 'pending' AND ar.expires_at > datetime('now')
      `).get(data.requestId) as { requested_by: number; target_user_id: number; target_email: string } | undefined;

      if (!request) {
        return { success: false, error: 'Request not found or expired' };
      }

      // Verify approver is admin and not the same as requester
      const approver = authDb.prepare('SELECT id FROM users WHERE id = ? AND role = "admin" AND is_active = 1').get(data.approvingAdminId) as { id: number } | undefined;
      if (!approver) {
        return { success: false, error: 'Only admins can approve requests' };
      }
      if (request.requested_by === data.approvingAdminId) {
        return { success: false, error: 'Cannot approve your own request' };
      }

      // Start transaction
      const transaction = authDb.transaction(() => {
        // Update request status
        authDb.prepare(`
          UPDATE admin_approval_requests 
          SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(data.approvingAdminId, data.requestId);

        // Promote user to admin
        authDb.prepare('UPDATE users SET role = "admin" WHERE id = ?').run(request.target_user_id);

        // Log the approval
        authDb.prepare(`
          INSERT INTO admin_audit_log (admin_id, action, target_user_id, target_email, details, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          data.approvingAdminId,
          'ADMIN_PROMOTION_APPROVED',
          request.target_user_id,
          request.target_email,
          `Promotion request #${data.requestId} approved`,
          data.ipAddress,
          data.userAgent
        );
      });

      transaction();
      return { success: true };
    } catch (error) {
      console.error('Error approving admin promotion:', error);
      return { success: false, error: 'Failed to approve promotion' };
    }
  },

  // Get pending admin requests (for approval)
  getPendingAdminRequests: (): any[] => {
    return authDb.prepare(`
      SELECT ar.*, 
             u1.email as target_email, u1.first_name as target_first_name, u1.last_name as target_last_name,
             u2.email as requester_email, u2.first_name as requester_first_name, u2.last_name as requester_last_name
      FROM admin_approval_requests ar
      JOIN users u1 ON ar.target_user_id = u1.id
      JOIN users u2 ON ar.requested_by = u2.id
      WHERE ar.status = 'pending' AND ar.expires_at > datetime('now')
      ORDER BY ar.created_at DESC
    `).all();
  },

  // Get admin audit log
  getAdminAuditLog: (limit: number = 100): any[] => {
    return authDb.prepare(`
      SELECT al.*, u.email as admin_email, u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM admin_audit_log al
      JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(limit);
  },

  // Update user profile
  updateUserProfile: (userId: number, profileData: {
    first_name: string;
    last_name: string;
    email: string;
  }): { success: boolean; error?: string } => {
    try {
      // Check if email is already taken by another user
      const existingUser = authDb.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(profileData.email, userId) as { id: number } | undefined;
      if (existingUser) {
        return { success: false, error: 'Email is already taken by another user' };
      }

      // Update user profile
      const result = authDb.prepare(`
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(profileData.first_name, profileData.last_name, profileData.email, userId);

      if (result.changes > 0) {
        return { success: true };
      } else {
        return { success: false, error: 'User not found or no changes made' };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }
};

export default authDb; 