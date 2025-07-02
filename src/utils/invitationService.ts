import { createClient } from '@/lib/supabase/client';
import { logger } from './logger';
import { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import crypto from 'crypto';

export interface CreateInvitationParams {
  orgId: string;
  email: string;
  invitedBy: string;
  roles?: string[];
  message?: string;
  expiresInHours?: number;
  metadata?: Record<string, any>;
}

export interface InvitationResponse {
  success: boolean;
  invitationId?: string;
  token?: string;
  error?: string;
}

export interface AcceptInvitationParams {
  token: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface InvitationDetails {
  id: string;
  orgId: string;
  email: string;
  invitedBy: string;
  roles: string[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  message?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  cancelled: number;
}

class InvitationService {
  private supabase = createClient();

  /**
   * Generate a cryptographically secure invitation token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify a token against its hash
   */
  private verifyToken(token: string, hash: string): boolean {
    return this.hashToken(token) === hash;
  }

  /**
   * Create a new user invitation
   */
  async createInvitation(params: CreateInvitationParams): Promise<InvitationResponse> {
    try {
      const {
        orgId,
        email,
        invitedBy,
        roles = [],
        message,
        expiresInHours = 72, // Default 3 days
        metadata = {}
      } = params;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id, org_id')
        .eq('email', email)
        .single();

      if (existingUser) {
        if (existingUser.org_id === orgId) {
          return { success: false, error: 'User is already a member of this organization' };
        }
        return { success: false, error: 'User already exists in another organization' };
      }

      // Check if invitation already exists for this email and org
      const { data: existingInvitation } = await this.supabase
        .from('user_invitations')
        .select('id, status')
        .eq('org_id', orgId)
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        return { success: false, error: 'Invitation already exists for this email' };
      }

      // Generate secure token
      const token = this.generateToken();
      const tokenHash = this.hashToken(token);

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      // Create invitation record
      const invitationData: TablesInsert<'user_invitations'> = {
        org_id: orgId,
        email,
        invited_by: invitedBy,
        roles,
        status: 'pending',
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        message,
        metadata
      };

      const { data: invitation, error } = await this.supabase
        .from('user_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create invitation:', error);
        return { success: false, error: 'Failed to create invitation' };
      }

      // Log audit event
      await this.logAuditEvent({
        orgId,
        userId: invitedBy,
        actionType: 'user_invited',
        resourceType: 'user_invitation',
        resourceId: invitation.id,
        newValues: { email, roles, expiresAt: expiresAt.toISOString() },
        metadata: { invitationId: invitation.id }
      });

      // TODO: Send invitation email
      await this.sendInvitationEmail(email, token, invitation.id, orgId);

      return {
        success: true,
        invitationId: invitation.id,
        token
      };

    } catch (error) {
      logger.error('Error creating invitation:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Accept an invitation using a token
   */
  async acceptInvitation(params: AcceptInvitationParams): Promise<InvitationResponse> {
    try {
      const { token, userId, firstName, lastName, phone } = params;

      // Find invitation by token hash
      const tokenHash = this.hashToken(token);
      const { data: invitation, error: invitationError } = await this.supabase
        .from('user_invitations')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation token' };
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        // Update status to expired
        await this.supabase
          .from('user_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);

        return { success: false, error: 'Invitation has expired' };
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id, org_id')
        .eq('id', userId)
        .single();

      if (existingUser && existingUser.org_id) {
        return { success: false, error: 'User is already a member of an organization' };
      }

      // Update user with organization details
      const userUpdateData: TablesUpdate<'users'> = {
        org_id: invitation.org_id,
        account_type: 'organization_member'
      };

      if (firstName) userUpdateData.first_name = firstName;
      if (lastName) userUpdateData.last_name = lastName;
      if (phone) userUpdateData.phone = phone;

      const { error: userUpdateError } = await this.supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', userId);

      if (userUpdateError) {
        logger.error('Failed to update user:', userUpdateError);
        return { success: false, error: 'Failed to accept invitation' };
      }

      // Update invitation status
      const { error: invitationUpdateError } = await this.supabase
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userId
        })
        .eq('id', invitation.id);

      if (invitationUpdateError) {
        logger.error('Failed to update invitation status:', invitationUpdateError);
        return { success: false, error: 'Failed to accept invitation' };
      }

      // Log audit event
      await this.logAuditEvent({
        orgId: invitation.org_id,
        userId,
        actionType: 'user_accepted_invitation',
        resourceType: 'user_invitation',
        resourceId: invitation.id,
        oldValues: { status: 'pending' },
        newValues: { status: 'accepted', acceptedBy: userId },
        metadata: { invitationId: invitation.id }
      });

      return { success: true, invitationId: invitation.id };

    } catch (error) {
      logger.error('Error accepting invitation:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get invitation details by token
   */
  async getInvitationByToken(token: string): Promise<InvitationDetails | null> {
    try {
      const tokenHash = this.hashToken(token);
      const { data: invitation, error } = await this.supabase
        .from('user_invitations')
        .select(`
          id,
          org_id,
          email,
          invited_by,
          roles,
          status,
          expires_at,
          message,
          metadata,
          created_at
        `)
        .eq('token_hash', tokenHash)
        .single();

      if (error || !invitation) {
        return null;
      }

      return {
        id: invitation.id,
        orgId: invitation.org_id,
        email: invitation.email,
        invitedBy: invitation.invited_by,
        roles: invitation.roles,
        status: invitation.status as any,
        expiresAt: invitation.expires_at,
        message: invitation.message,
        metadata: invitation.metadata,
        createdAt: invitation.created_at!
      };

    } catch (error) {
      logger.error('Error getting invitation by token:', error);
      return null;
    }
  }

  /**
   * Get all invitations for an organization
   */
  async getOrganizationInvitations(orgId: string): Promise<InvitationDetails[]> {
    try {
      const { data: invitations, error } = await this.supabase
        .from('user_invitations')
        .select(`
          id,
          org_id,
          email,
          invited_by,
          roles,
          status,
          expires_at,
          message,
          metadata,
          created_at
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get organization invitations:', error);
        return [];
      }

      return invitations.map(invitation => ({
        id: invitation.id,
        orgId: invitation.org_id,
        email: invitation.email,
        invitedBy: invitation.invited_by,
        roles: invitation.roles,
        status: invitation.status as any,
        expiresAt: invitation.expires_at,
        message: invitation.message,
        metadata: invitation.metadata,
        createdAt: invitation.created_at!
      }));

    } catch (error) {
      logger.error('Error getting organization invitations:', error);
      return [];
    }
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string, cancelledBy: string): Promise<InvitationResponse> {
    try {
      const { data: invitation, error: fetchError } = await this.supabase
        .from('user_invitations')
        .select('org_id, status')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        return { success: false, error: 'Invitation not found' };
      }

      if (invitation.status !== 'pending') {
        return { success: false, error: 'Invitation cannot be cancelled' };
      }

      const { error: updateError } = await this.supabase
        .from('user_invitations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        logger.error('Failed to cancel invitation:', updateError);
        return { success: false, error: 'Failed to cancel invitation' };
      }

      // Log audit event
      await this.logAuditEvent({
        orgId: invitation.org_id,
        userId: cancelledBy,
        actionType: 'invitation_cancelled',
        resourceType: 'user_invitation',
        resourceId: invitationId,
        oldValues: { status: 'pending' },
        newValues: { status: 'cancelled' }
      });

      return { success: true, invitationId };

    } catch (error) {
      logger.error('Error cancelling invitation:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Resend an invitation
   */
  async resendInvitation(invitationId: string, resentBy: string): Promise<InvitationResponse> {
    try {
      const { data: invitation, error: fetchError } = await this.supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        return { success: false, error: 'Invitation not found' };
      }

      if (invitation.status !== 'pending') {
        return { success: false, error: 'Invitation cannot be resent' };
      }

      // Generate new token and expiration
      const newToken = this.generateToken();
      const newTokenHash = this.hashToken(newToken);
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + 72); // 3 days

      const { error: updateError } = await this.supabase
        .from('user_invitations')
        .update({
          token_hash: newTokenHash,
          expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        logger.error('Failed to resend invitation:', updateError);
        return { success: false, error: 'Failed to resend invitation' };
      }

      // Log audit event
      await this.logAuditEvent({
        orgId: invitation.org_id,
        userId: resentBy,
        actionType: 'invitation_resent',
        resourceType: 'user_invitation',
        resourceId: invitationId,
        oldValues: { expiresAt: invitation.expires_at },
        newValues: { expiresAt: newExpiresAt.toISOString() }
      });

      // TODO: Send new invitation email
      await this.sendInvitationEmail(invitation.email, newToken, invitationId, invitation.org_id);

      return { success: true, invitationId, token: newToken };

    } catch (error) {
      logger.error('Error resending invitation:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get invitation statistics for an organization
   */
  async getInvitationStats(orgId: string): Promise<InvitationStats> {
    try {
      const { data: invitations, error } = await this.supabase
        .from('user_invitations')
        .select('status')
        .eq('org_id', orgId);

      if (error) {
        logger.error('Failed to get invitation stats:', error);
        return { total: 0, pending: 0, accepted: 0, expired: 0, cancelled: 0 };
      }

      const stats: InvitationStats = {
        total: invitations.length,
        pending: invitations.filter(i => i.status === 'pending').length,
        accepted: invitations.filter(i => i.status === 'accepted').length,
        expired: invitations.filter(i => i.status === 'expired').length,
        cancelled: invitations.filter(i => i.status === 'cancelled').length
      };

      return stats;

    } catch (error) {
      logger.error('Error getting invitation stats:', error);
      return { total: 0, pending: 0, accepted: 0, expired: 0, cancelled: 0 };
    }
  }

  /**
   * Clean up expired invitations
   */
  async cleanupExpiredInvitations(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc('cleanup_expired_invitations');

      if (error) {
        logger.error('Failed to cleanup expired invitations:', error);
        return 0;
      }

      return data || 0;

    } catch (error) {
      logger.error('Error cleaning up expired invitations:', error);
      return 0;
    }
  }

  /**
   * Send invitation email (placeholder for email service integration)
   */
  private async sendInvitationEmail(
    email: string,
    token: string,
    invitationId: string,
    orgId: string
  ): Promise<void> {
    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/account/accept-invitation?token=${token}`;
      
      logger.info('Invitation email would be sent:', {
        to: email,
        invitationId,
        orgId,
        url: invitationUrl
      });

      // Placeholder for actual email sending
      // await emailService.sendInvitation({
      //   to: email,
      //   invitationUrl,
      //   orgName: orgName,
      //   invitedBy: invitedBy
      // });

    } catch (error) {
      logger.error('Failed to send invitation email:', error);
    }
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(params: {
    orgId: string;
    userId: string;
    actionType: string;
    resourceType: string;
    resourceId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.supabase.rpc('log_audit_event', {
        p_org_id: params.orgId,
        p_user_id: params.userId,
        p_action_type: params.actionType,
        p_resource_type: params.resourceType,
        p_resource_id: params.resourceId,
        p_old_values: params.oldValues,
        p_new_values: params.newValues,
        p_metadata: params.metadata
      });
    } catch (error) {
      logger.error('Failed to log audit event:', error);
    }
  }
}

// Export singleton instance
export const invitationService = new InvitationService(); 