import { createClient } from '@/lib/supabase/client';
import { logger } from './logger';
import { invitationService } from './invitationService';
import { auditService, auditEvents } from './auditService';
import { securityService, securityChecks } from './securityService';
import { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  orgId?: string;
  accountType: 'personal' | 'organization_admin' | 'organization_member';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserParams {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  orgId?: string;
  accountType?: 'personal' | 'organization_admin' | 'organization_member';
}

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  accountType?: 'personal' | 'organization_admin' | 'organization_member';
}

export interface UserManagementResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  organizationAdmins: number;
  organizationMembers: number;
  personalUsers: number;
  recentRegistrations: number;
  pendingInvitations: number;
}

export interface UserActivity {
  userId: string;
  lastLogin: string;
  loginCount: number;
  gameSessions: number;
  avatarsCreated: number;
  recentActivity: string[];
}

class UserManagementService {
  private supabase = createClient();

  /**
   * Create a new user
   */
  async createUser(params: CreateUserParams): Promise<UserManagementResponse> {
    try {
      // Validate email
      const emailValidation = securityChecks.validateEmail(params.email);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', params.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Create user record
      const userData: TablesInsert<'users'> = {
        id: crypto.randomUUID(), // Generate UUID for the user
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        phone: params.phone,
        timezone: params.timezone || 'UTC',
        locale: params.locale || 'en-US',
        org_id: params.orgId,
        account_type: params.accountType || 'personal'
      };

      const { data: user, error } = await this.supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create user:', error);
        return { success: false, error: 'Failed to create user' };
      }

      // Log audit event
      await auditEvents.organizationCreated({
        orgId: params.orgId,
        userId: user.id,
        resourceId: user.id,
        newValues: { email: params.email, accountType: params.accountType }
      });

      return { success: true, data: user };

    } catch (error) {
      logger.error('Error creating user:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        timezone: user.timezone,
        locale: user.locale,
        orgId: user.org_id,
        accountType: user.account_type as any,
        lastLogin: user.last_login,
        createdAt: user.created_at!,
        updatedAt: user.updated_at!
      };

    } catch (error) {
      logger.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    params: UpdateUserParams,
    updatedBy: string
  ): Promise<UserManagementResponse> {
    try {
      // Get current user data for audit
      const currentUser = await this.getUserProfile(userId);
      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      // Validate input
      if (params.firstName) {
        const nameValidation = securityChecks.validateName(params.firstName);
        if (!nameValidation.valid) {
          return { success: false, error: nameValidation.error };
        }
      }

      if (params.lastName) {
        const nameValidation = securityChecks.validateName(params.lastName);
        if (!nameValidation.valid) {
          return { success: false, error: nameValidation.error };
        }
      }

      if (params.phone) {
        const phoneValidation = securityChecks.validatePhone(params.phone);
        if (!phoneValidation.valid) {
          return { success: false, error: phoneValidation.error };
        }
      }

      // Prepare update data
      const updateData: TablesUpdate<'users'> = {};
      if (params.firstName !== undefined) updateData.first_name = params.firstName;
      if (params.lastName !== undefined) updateData.last_name = params.lastName;
      if (params.phone !== undefined) updateData.phone = params.phone;
      if (params.timezone !== undefined) updateData.timezone = params.timezone;
      if (params.locale !== undefined) updateData.locale = params.locale;
      if (params.accountType !== undefined) updateData.account_type = params.accountType;

      const { data: user, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update user:', error);
        return { success: false, error: 'Failed to update user' };
      }

      // Log audit event
      await auditEvents.settingsChanged({
        orgId: currentUser.orgId,
        userId: updatedBy,
        resourceId: userId,
        oldValues: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: currentUser.phone,
          timezone: currentUser.timezone,
          locale: currentUser.locale,
          accountType: currentUser.accountType
        },
        newValues: {
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          timezone: user.timezone,
          locale: user.locale,
          accountType: user.account_type
        }
      });

      return { success: true, data: user };

    } catch (error) {
      logger.error('Error updating user profile:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get organization users
   */
  async getOrganizationUsers(orgId: string): Promise<UserProfile[]> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get organization users:', error);
        return [];
      }

      return users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        timezone: user.timezone,
        locale: user.locale,
        orgId: user.org_id,
        accountType: user.account_type as any,
        lastLogin: user.last_login,
        createdAt: user.created_at!,
        updatedAt: user.updated_at!
      }));

    } catch (error) {
      logger.error('Error getting organization users:', error);
      return [];
    }
  }

  /**
   * Change user role
   */
  async changeUserRole(
    userId: string,
    newRole: 'personal' | 'organization_admin' | 'organization_member',
    changedBy: string
  ): Promise<UserManagementResponse> {
    try {
      const currentUser = await this.getUserProfile(userId);
      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      const { data: user, error } = await this.supabase
        .from('users')
        .update({ account_type: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to change user role:', error);
        return { success: false, error: 'Failed to change user role' };
      }

      // Log audit event
      await auditEvents.userRoleChanged({
        orgId: currentUser.orgId,
        userId: changedBy,
        resourceId: userId,
        oldValues: { accountType: currentUser.accountType },
        newValues: { accountType: newRole }
      });

      return { success: true, data: user };

    } catch (error) {
      logger.error('Error changing user role:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    userId: string,
    removedBy: string
  ): Promise<UserManagementResponse> {
    try {
      const currentUser = await this.getUserProfile(userId);
      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      if (!currentUser.orgId) {
        return { success: false, error: 'User is not part of an organization' };
      }

      const { data: user, error } = await this.supabase
        .from('users')
        .update({
          org_id: null,
          account_type: 'personal'
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to remove user from organization:', error);
        return { success: false, error: 'Failed to remove user from organization' };
      }

      // Log audit event
      await auditEvents.userRoleChanged({
        orgId: currentUser.orgId,
        userId: removedBy,
        resourceId: userId,
        oldValues: { orgId: currentUser.orgId, accountType: currentUser.accountType },
        newValues: { orgId: null, accountType: 'personal' }
      });

      return { success: true, data: user };

    } catch (error) {
      logger.error('Error removing user from organization:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(orgId?: string): Promise<UserStats> {
    try {
      let query = this.supabase.from('users').select('account_type, created_at');

      if (orgId) {
        query = query.eq('org_id', orgId);
      }

      const { data: users, error } = await query;

      if (error) {
        logger.error('Failed to get user stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          organizationAdmins: 0,
          organizationMembers: 0,
          personalUsers: 0,
          recentRegistrations: 0,
          pendingInvitations: 0
        };
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.last_login && new Date(u.last_login) > thirtyDaysAgo).length,
        organizationAdmins: users.filter(u => u.account_type === 'organization_admin').length,
        organizationMembers: users.filter(u => u.account_type === 'organization_member').length,
        personalUsers: users.filter(u => u.account_type === 'personal').length,
        recentRegistrations: users.filter(u => new Date(u.created_at!) > thirtyDaysAgo).length,
        pendingInvitations: 0
      };

      // Get pending invitations if orgId is provided
      if (orgId) {
        const invitationStats = await invitationService.getInvitationStats(orgId);
        stats.pendingInvitations = invitationStats.pending;
      }

      return stats;

    } catch (error) {
      logger.error('Error getting user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        organizationAdmins: 0,
        organizationMembers: 0,
        personalUsers: 0,
        recentRegistrations: 0,
        pendingInvitations: 0
      };
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string): Promise<UserActivity | null> {
    try {
      // Get user profile
      const user = await this.getUserProfile(userId);
      if (!user) {
        return null;
      }

      // Get recent audit logs
      const recentActivity = await auditService.getUserActivity(userId, 10);

      // Get game sessions count
      const { data: gameSessions, error: sessionsError } = await this.supabase
        .from('game_sessions')
        .select('id')
        .eq('avatar_id', userId); // This would need to be adjusted based on your schema

      // Get avatars count
      const { data: avatars, error: avatarsError } = await this.supabase
        .from('avatars')
        .select('id')
        .eq('user_id', userId);

      return {
        userId,
        lastLogin: user.lastLogin || user.createdAt,
        loginCount: recentActivity.filter(a => a.actionType === 'login_success').length,
        gameSessions: gameSessions?.length || 0,
        avatarsCreated: avatars?.length || 0,
        recentActivity: recentActivity.map(a => `${a.actionType} - ${new Date(a.createdAt).toLocaleDateString()}`)
      };

    } catch (error) {
      logger.error('Error getting user activity:', error);
      return null;
    }
  }

  /**
   * Search users
   */
  async searchUsers(
    searchTerm: string,
    orgId?: string,
    limit: number = 50
  ): Promise<UserProfile[]> {
    try {
      let query = this.supabase
        .from('users')
        .select('*')
        .or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(limit);

      if (orgId) {
        query = query.eq('org_id', orgId);
      }

      const { data: users, error } = await query;

      if (error) {
        logger.error('Failed to search users:', error);
        return [];
      }

      return users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        timezone: user.timezone,
        locale: user.locale,
        orgId: user.org_id,
        accountType: user.account_type as any,
        lastLogin: user.last_login,
        createdAt: user.created_at!,
        updatedAt: user.updated_at!
      }));

    } catch (error) {
      logger.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Bulk invite users
   */
  async bulkInviteUsers(
    emails: string[],
    orgId: string,
    invitedBy: string,
    roles: string[] = [],
    message?: string
  ): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; error?: string }> }> {
    try {
      const results = [];

      for (const email of emails) {
        const result = await invitationService.createInvitation({
          orgId,
          email,
          invitedBy,
          roles,
          message
        });

        results.push({
          email,
          success: result.success,
          error: result.error
        });
      }

      return { success: true, results };

    } catch (error) {
      logger.error('Error bulk inviting users:', error);
      return { success: false, results: [] };
    }
  }

  /**
   * Export user data for compliance
   */
  async exportUserData(userId: string): Promise<Record<string, any> | null> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) {
        return null;
      }

      // Get user activity
      const activity = await this.getUserActivity(userId);

      // Get audit logs
      const auditLogs = await auditService.getUserActivity(userId, 100);

      // Get avatars
      const { data: avatars } = await this.supabase
        .from('avatars')
        .select('*')
        .eq('user_id', userId);

      // Get game sessions
      const { data: gameSessions } = await this.supabase
        .from('game_sessions')
        .select('*')
        .eq('avatar_id', userId);

      return {
        user,
        activity,
        auditLogs,
        avatars: avatars || [],
        gameSessions: gameSessions || [],
        exportedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error exporting user data:', error);
      return null;
    }
  }

  /**
   * Delete user (soft delete for compliance)
   */
  async deleteUser(
    userId: string,
    deletedBy: string
  ): Promise<UserManagementResponse> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // For compliance, we'll mark the user as deleted rather than actually deleting
      // In a real implementation, you might want to create a separate deleted_users table
      const { data, error } = await this.supabase
        .from('users')
        .update({
          email: `deleted_${userId}@deleted.com`,
          first_name: 'Deleted',
          last_name: 'User',
          phone: null,
          org_id: null,
          account_type: 'personal'
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to delete user:', error);
        return { success: false, error: 'Failed to delete user' };
      }

      // Log audit event
      await auditEvents.userRoleChanged({
        orgId: user.orgId,
        userId: deletedBy,
        resourceId: userId,
        oldValues: { email: user.email, firstName: user.firstName, lastName: user.lastName },
        newValues: { email: data.email, firstName: 'Deleted', lastName: 'User' }
      });

      return { success: true, data };

    } catch (error) {
      logger.error('Error deleting user:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService(); 