import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dynamoOperations, generateId, formatTimestamp } from './dynamodb-client';
import { UserItem, SessionItem } from './dynamodb-schema';
import { logSecurityEvent, createAuditLog } from './security';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const BCRYPT_ROUNDS = 12;

// DynamoDB Authentication Operations
export const dynamoAuthOperations = {
  // Create new user
  createUser: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'user' | 'admin' | 'coach';
  }) => {
    try {
      const email = data.email.toLowerCase().trim();
      
      // Check if user already exists
      const existingUser = await dynamoOperations.get(`USER#${email}`, `PROFILE#${email}`);
      if (existingUser.success && existingUser.item) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(data.password, BCRYPT_ROUNDS);
      
      // Create user item
      const userItem: UserItem = {
        PK: `USER#${email}`,
        SK: `PROFILE#${email}`,
        email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'user',
        isActive: true,
        createdAt: formatTimestamp(),
        passwordHash: hashedPassword,
      };

      // Save to DynamoDB
      const result = await dynamoOperations.put(userItem);
      if (!result.success) {
        return { success: false, error: 'Failed to create user' };
      }

      // Log audit event
      logSecurityEvent(createAuditLog({
        action: 'USER_CREATED',
        resource: 'users',
        details: { email, role: data.role },
        success: true,
      }));

      return { 
        success: true, 
        user: {
          id: email,
          email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || 'user',
        }
      };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: 'Internal server error' };
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      const email = credentials.email.toLowerCase().trim();
      
      // Get user from DynamoDB
      const result = await dynamoOperations.get(`USER#${email}`, `PROFILE#${email}`);
      if (!result.success || !result.item) {
        return { success: false, error: 'Invalid credentials' };
      }

      const user = result.item as UserItem;
      
      // Check if user is active
      if (!user.isActive) {
        return { success: false, error: 'Account is deactivated' };
      }

      // Verify password
      const passwordValid = bcrypt.compareSync(credentials.password, user.passwordHash);
      if (!passwordValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Update last login
      await dynamoOperations.update(
        `USER#${email}`,
        `PROFILE#${email}`,
        'SET lastLogin = :lastLogin',
        { ':lastLogin': formatTimestamp() }
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: email, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Create session in DynamoDB
      const sessionItem: SessionItem = {
        PK: `USER#${email}`,
        SK: `SESSION#${token}`,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        userId: email,
      };

      await dynamoOperations.put(sessionItem);

      return {
        success: true,
        user: {
          id: email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Internal server error' };
    }
  },

  // Verify JWT token
  verifyToken: async (token: string) => {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if session exists in DynamoDB
      const sessionResult = await dynamoOperations.get(`USER#${decoded.email}`, `SESSION#${token}`);
      if (!sessionResult.success || !sessionResult.item) {
        return { valid: false, error: 'Invalid or expired session' };
      }

      const session = sessionResult.item as SessionItem;
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        // Clean up expired session
        await dynamoOperations.delete(`USER#${decoded.email}`, `SESSION#${token}`);
        return { valid: false, error: 'Session expired' };
      }

      // Get user details
      const userResult = await dynamoOperations.get(`USER#${decoded.email}`, `PROFILE#${decoded.email}`);
      if (!userResult.success || !userResult.item) {
        return { valid: false, error: 'User not found' };
      }

      const user = userResult.item as UserItem;
      
      // Check if user is active
      if (!user.isActive) {
        return { valid: false, error: 'Account is deactivated' };
      }

      return {
        valid: true,
        user: {
          id: user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  },

  // Logout (invalidate session)
  logout: async (token: string) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      await dynamoOperations.delete(`USER#${decoded.email}`, `SESSION#${token}`);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const result = await dynamoOperations.scan('begins_with(PK, :pk)', { ':pk': 'USER#' });
      if (!result.success) {
        return [];
      }

      return (result.items as any[])
        .filter((item: any) => item.SK?.startsWith('PROFILE#'))
        .map((item: any) => ({
          id: item.email,
          email: item.email,
          firstName: item.firstName,
          lastName: item.lastName,
          role: item.role,
          isActive: item.isActive,
          createdAt: item.createdAt,
          lastLogin: item.lastLogin,
        }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, role: 'user' | 'admin' | 'coach') => {
    try {
      const result = await dynamoOperations.update(
        `USER#${userId}`,
        `PROFILE#${userId}`,
        'SET #role = :role',
        { ':role': role },
        { '#role': 'role' }
      );

      if (result.success) {
        logSecurityEvent(createAuditLog({
          action: 'USER_ROLE_UPDATED',
          resource: 'users',
          details: { userId, newRole: role },
          success: true,
        }));
      }

      return result.success;
    } catch (error) {
      console.error('Update user role error:', error);
      return false;
    }
  },

  // Update user profile (firstName, lastName, email)
  updateUserProfile: async (userId: string, data: { firstName: string; lastName: string; email: string }) => {
    try {
      const currentPk = `USER#${userId}`;
      const currentSk = `PROFILE#${userId}`;

      // If email is changing, we need to create a new item and optionally delete the old one.
      if (userId !== data.email) {
        // Get existing user
        const existing = await dynamoOperations.get(currentPk, currentSk);
        if (!existing.success || !existing.item) return { success: false, error: 'User not found' };

        const updated = {
          ...(existing.item as any),
          PK: `USER#${data.email}`,
          SK: `PROFILE#${data.email}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        } as UserItem;

        const putRes = await dynamoOperations.put(updated);
        if (!putRes.success) return { success: false, error: 'Failed to update user' };

        // Delete old record
        await dynamoOperations.delete(currentPk, currentSk);
        return { success: true };
      }

      // Email unchanged; simple update
      const res = await dynamoOperations.update(
        currentPk,
        currentSk,
        'SET #firstName = :firstName, #lastName = :lastName',
        { ':firstName': data.firstName, ':lastName': data.lastName },
        { '#firstName': 'firstName', '#lastName': 'lastName' }
      );

      return { success: res.success, error: res.success ? undefined : 'Failed to update user' };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { success: false, error: 'Internal error' };
    }
  },

  // Clean up expired sessions
  cleanupExpiredSessions: async () => {
    try {
      const result = await dynamoOperations.scan('begins_with(SK, :sk)', { ':sk': 'SESSION#' });
      if (!result.success) {
        return 0;
      }

      let deletedCount = 0;
      const now = new Date();

      for (const item of result.items) {
        if (new Date(item.expiresAt) < now) {
          await dynamoOperations.delete(item.PK, item.SK);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Cleanup sessions error:', error);
      return 0;
    }
  },
}; 