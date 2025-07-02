import { invitationService } from '../invitationService';
import { auditService } from '../auditService';
import { securityService } from '../securityService';
import { userManagementService } from '../userManagementService';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'test-user-id', email: 'test@example.com' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'test-user-id', email: 'test@example.com' },
              error: null
            }))
          }))
        }))
      })),
      rpc: jest.fn(() => ({
        data: true,
        error: null
      }))
    }))
  }))
}));

describe('User Management System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Invitation Service', () => {
    it('should create an invitation successfully', async () => {
      const params = {
        orgId: 'test-org-id',
        email: 'test@example.com',
        invitedBy: 'admin-user-id',
        roles: ['member'],
        message: 'Welcome to our organization!'
      };

      const result = await invitationService.createInvitation(params);

      expect(result.success).toBe(true);
      expect(result.invitationId).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should validate email format', async () => {
      const params = {
        orgId: 'test-org-id',
        email: 'invalid-email',
        invitedBy: 'admin-user-id'
      };

      const result = await invitationService.createInvitation(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should prevent duplicate invitations', async () => {
      // Mock existing invitation
      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: { id: 'existing-invitation-id' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      });

      const params = {
        orgId: 'test-org-id',
        email: 'test@example.com',
        invitedBy: 'admin-user-id'
      };

      const result = await invitationService.createInvitation(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invitation already exists for this email');
    });
  });

  describe('Security Service', () => {
    it('should validate email format correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com'
      ];

      validEmails.forEach(email => {
        const result = securityService.validateInput(email, 'email');
        expect(result.valid).toBe(true);
      });

      invalidEmails.forEach(email => {
        const result = securityService.validateInput(email, 'email');
        expect(result.valid).toBe(false);
      });
    });

    it('should validate name format correctly', () => {
      const validNames = ['John', 'Mary Jane', 'O\'Connor', 'Jean-Pierre'];
      const invalidNames = ['', 'A'.repeat(101), 'John123', 'Mary@Jane'];

      validNames.forEach(name => {
        const result = securityService.validateInput(name, 'name');
        expect(result.valid).toBe(true);
      });

      invalidNames.forEach(name => {
        const result = securityService.validateInput(name, 'name');
        expect(result.valid).toBe(false);
      });
    });

    it('should check rate limits correctly', async () => {
      const result = await securityService.checkRateLimit(
        'test@example.com',
        'email',
        'login'
      );

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
    });

    it('should detect suspicious activity', async () => {
      const result = await securityService.detectSuspiciousActivity(
        'test@example.com',
        'email',
        'login_failed',
        { ipAddress: '192.168.1.1' }
      );

      expect(result).toHaveProperty('suspicious');
      expect(result).toHaveProperty('reasons');
      expect(Array.isArray(result.reasons)).toBe(true);
    });
  });

  describe('Audit Service', () => {
    it('should log audit events', async () => {
      const auditId = await auditService.logEvent({
        orgId: 'test-org-id',
        userId: 'test-user-id',
        actionType: 'user_invited',
        resourceType: 'user_invitation',
        resourceId: 'invitation-id',
        newValues: { email: 'test@example.com' }
      });

      expect(auditId).toBeDefined();
    });

    it('should get audit logs with filters', async () => {
      const logs = await auditService.getAuditLogs({
        orgId: 'test-org-id',
        actionType: 'user_invited',
        limit: 10
      });

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should get audit statistics', async () => {
      const stats = await auditService.getAuditStats('test-org-id', 30);

      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('eventsByAction');
      expect(stats).toHaveProperty('eventsByResource');
      expect(stats).toHaveProperty('eventsByUser');
      expect(stats).toHaveProperty('recentActivity');
    });
  });

  describe('User Management Service', () => {
    it('should create a user successfully', async () => {
      const params = {
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        timezone: 'UTC',
        locale: 'en-US',
        orgId: 'test-org-id',
        accountType: 'organization_member' as const
      };

      const result = await userManagementService.createUser(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate user input', async () => {
      const invalidParams = {
        email: 'invalid-email',
        firstName: 'John123',
        phone: 'invalid-phone'
      };

      const result = await userManagementService.createUser(invalidParams as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should get user profile', async () => {
      const profile = await userManagementService.getUserProfile('test-user-id');

      expect(profile).toBeDefined();
      if (profile) {
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('email');
        expect(profile).toHaveProperty('accountType');
      }
    });

    it('should update user profile', async () => {
      const updateParams = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1987654321'
      };

      const result = await userManagementService.updateUserProfile(
        'test-user-id',
        updateParams,
        'admin-user-id'
      );

      expect(result.success).toBe(true);
    });

    it('should get organization users', async () => {
      const users = await userManagementService.getOrganizationUsers('test-org-id');

      expect(Array.isArray(users)).toBe(true);
      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('accountType');
      });
    });

    it('should change user role', async () => {
      const result = await userManagementService.changeUserRole(
        'test-user-id',
        'organization_admin',
        'admin-user-id'
      );

      expect(result.success).toBe(true);
    });

    it('should get user statistics', async () => {
      const stats = await userManagementService.getUserStats('test-org-id');

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('organizationAdmins');
      expect(stats).toHaveProperty('organizationMembers');
      expect(stats).toHaveProperty('personalUsers');
      expect(stats).toHaveProperty('recentRegistrations');
      expect(stats).toHaveProperty('pendingInvitations');
    });

    it('should search users', async () => {
      const users = await userManagementService.searchUsers(
        'john',
        'test-org-id',
        10
      );

      expect(Array.isArray(users)).toBe(true);
    });

    it('should bulk invite users', async () => {
      const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

      const result = await userManagementService.bulkInviteUsers(
        emails,
        'test-org-id',
        'admin-user-id',
        ['member'],
        'Welcome to our organization!'
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(emails.length);
    });

    it('should export user data', async () => {
      const userData = await userManagementService.exportUserData('test-user-id');

      expect(userData).toBeDefined();
      if (userData) {
        expect(userData).toHaveProperty('user');
        expect(userData).toHaveProperty('activity');
        expect(userData).toHaveProperty('auditLogs');
        expect(userData).toHaveProperty('avatars');
        expect(userData).toHaveProperty('gameSessions');
        expect(userData).toHaveProperty('exportedAt');
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user invitation flow', async () => {
      // 1. Create invitation
      const invitationResult = await invitationService.createInvitation({
        orgId: 'test-org-id',
        email: 'newmember@example.com',
        invitedBy: 'admin-user-id',
        roles: ['member'],
        message: 'Welcome!'
      });

      expect(invitationResult.success).toBe(true);
      expect(invitationResult.token).toBeDefined();

      // 2. Get invitation details
      const invitation = await invitationService.getInvitationByToken(invitationResult.token!);
      expect(invitation).toBeDefined();
      expect(invitation?.email).toBe('newmember@example.com');

      // 3. Accept invitation
      const acceptResult = await invitationService.acceptInvitation({
        token: invitationResult.token!,
        userId: 'new-user-id',
        firstName: 'New',
        lastName: 'Member'
      });

      expect(acceptResult.success).toBe(true);

      // 4. Verify user was created
      const userProfile = await userManagementService.getUserProfile('new-user-id');
      expect(userProfile).toBeDefined();
      expect(userProfile?.orgId).toBe('test-org-id');
      expect(userProfile?.accountType).toBe('organization_member');
    });

    it('should handle security and audit integration', async () => {
      // 1. Check rate limit
      const rateLimitResult = await securityService.checkRateLimit(
        'test@example.com',
        'email',
        'login'
      );

      expect(rateLimitResult.allowed).toBeDefined();

      // 2. Log security event
      await securityService.logSecurityEvent({
        type: 'login_success',
        severity: 'low',
        identifier: 'test@example.com',
        identifierType: 'email',
        actionType: 'login',
        details: { ipAddress: '192.168.1.1' },
        timestamp: new Date().toISOString()
      });

      // 3. Get audit logs
      const auditLogs = await auditService.getAuditLogs({
        actionType: 'login_success',
        limit: 5
      });

      expect(Array.isArray(auditLogs)).toBe(true);
    });
  });
}); 