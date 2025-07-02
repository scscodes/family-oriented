import { createClient } from '@/lib/supabase/client';
import { logger } from './logger';

export type AuditActionType = 
  | 'user_invited' | 'user_accepted_invitation' | 'user_declined_invitation'
  | 'user_role_changed' | 'user_removed' | 'user_suspended' | 'user_reactivated'
  | 'invitation_expired' | 'invitation_cancelled' | 'invitation_resent'
  | 'login_attempt' | 'login_success' | 'login_failed' | 'logout'
  | 'password_changed' | 'password_reset' | 'email_changed'
  | 'organization_created' | 'organization_updated' | 'organization_deleted'
  | 'subscription_changed' | 'billing_updated' | 'policy_changed'
  | 'avatar_created' | 'avatar_updated' | 'avatar_deleted'
  | 'game_session_started' | 'game_session_completed' | 'game_session_abandoned'
  | 'data_exported' | 'data_imported' | 'settings_changed';

export type AuditResourceType = 
  | 'user' | 'user_invitation' | 'organization' | 'subscription'
  | 'avatar' | 'game_session' | 'game_event' | 'learning_progress'
  | 'permission_policy' | 'organization_policy' | 'user_policy'
  | 'theme_catalog' | 'game_collection' | 'audit_log' | 'rate_limit';

export interface AuditEventParams {
  orgId?: string;
  userId?: string;
  actionType: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  orgId?: string;
  userId?: string;
  actionType: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLogFilters {
  orgId?: string;
  userId?: string;
  actionType?: AuditActionType;
  resourceType?: AuditResourceType;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalEvents: number;
  eventsByAction: Record<AuditActionType, number>;
  eventsByResource: Record<AuditResourceType, number>;
  eventsByUser: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

class AuditService {
  private supabase = createClient();

  /**
   * Log an audit event
   */
  async logEvent(params: AuditEventParams): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('log_audit_event', {
        p_org_id: params.orgId,
        p_user_id: params.userId,
        p_action_type: params.actionType,
        p_resource_type: params.resourceType,
        p_resource_id: params.resourceId,
        p_old_values: params.oldValues,
        p_new_values: params.newValues,
        p_ip_address: params.ipAddress,
        p_user_agent: params.userAgent,
        p_session_id: params.sessionId,
        p_metadata: params.metadata
      });

      if (error) {
        logger.error('Failed to log audit event:', error);
        return null;
      }

      return data;

    } catch (error) {
      logger.error('Error logging audit event:', error);
      return null;
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.orgId) {
        query = query.eq('org_id', filters.orgId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters.resourceId) {
        query = query.eq('resource_id', filters.resourceId);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get audit logs:', error);
        return [];
      }

      return data.map(log => ({
        id: log.id,
        orgId: log.org_id,
        userId: log.user_id,
        actionType: log.action_type as AuditActionType,
        resourceType: log.resource_type as AuditResourceType,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        sessionId: log.session_id,
        metadata: log.metadata,
        createdAt: log.created_at!
      }));

    } catch (error) {
      logger.error('Error getting audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(orgId?: string, days: number = 30): Promise<AuditLogStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const filters: AuditLogFilters = {
        startDate: startDate.toISOString(),
        limit: 1000 // Get all events for stats calculation
      };

      if (orgId) {
        filters.orgId = orgId;
      }

      const logs = await this.getAuditLogs(filters);

      // Calculate statistics
      const eventsByAction: Record<AuditActionType, number> = {} as any;
      const eventsByResource: Record<AuditResourceType, number> = {} as any;
      const eventsByUser: Record<string, number> = {};

      logs.forEach(log => {
        // Count by action type
        eventsByAction[log.actionType] = (eventsByAction[log.actionType] || 0) + 1;

        // Count by resource type
        eventsByResource[log.resourceType] = (eventsByResource[log.resourceType] || 0) + 1;

        // Count by user
        if (log.userId) {
          eventsByUser[log.userId] = (eventsByUser[log.userId] || 0) + 1;
        }
      });

      return {
        totalEvents: logs.length,
        eventsByAction,
        eventsByResource,
        eventsByUser,
        recentActivity: logs.slice(0, 10) // Last 10 events
      };

    } catch (error) {
      logger.error('Error getting audit stats:', error);
      return {
        totalEvents: 0,
        eventsByAction: {} as any,
        eventsByResource: {} as any,
        eventsByUser: {},
        recentActivity: []
      };
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to get user activity:', error);
        return [];
      }

      return data.map(log => ({
        id: log.id,
        orgId: log.org_id,
        userId: log.user_id,
        actionType: log.action_type as AuditActionType,
        resourceType: log.resource_type as AuditResourceType,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        sessionId: log.session_id,
        metadata: log.metadata,
        createdAt: log.created_at!
      }));

    } catch (error) {
      logger.error('Error getting user activity:', error);
      return [];
    }
  }

  /**
   * Get resource activity timeline
   */
  async getResourceActivity(
    resourceType: AuditResourceType,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to get resource activity:', error);
        return [];
      }

      return data.map(log => ({
        id: log.id,
        orgId: log.org_id,
        userId: log.user_id,
        actionType: log.action_type as AuditActionType,
        resourceType: log.resource_type as AuditResourceType,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        sessionId: log.session_id,
        metadata: log.metadata,
        createdAt: log.created_at!
      }));

    } catch (error) {
      logger.error('Error getting resource activity:', error);
      return [];
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    searchTerm: string,
    filters: Omit<AuditLogFilters, 'limit' | 'offset'> = {}
  ): Promise<AuditLogEntry[]> {
    try {
      // For now, we'll do a simple search on action_type and resource_type
      // In a production environment, you might want to use full-text search
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .or(`action_type.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Failed to search audit logs:', error);
        return [];
      }

      // Apply additional filters in memory
      let filteredData = data;

      if (filters.orgId) {
        filteredData = filteredData.filter(log => log.org_id === filters.orgId);
      }

      if (filters.userId) {
        filteredData = filteredData.filter(log => log.user_id === filters.userId);
      }

      if (filters.startDate) {
        filteredData = filteredData.filter(log => log.created_at >= filters.startDate);
      }

      if (filters.endDate) {
        filteredData = filteredData.filter(log => log.created_at <= filters.endDate);
      }

      return filteredData.map(log => ({
        id: log.id,
        orgId: log.org_id,
        userId: log.user_id,
        actionType: log.action_type as AuditActionType,
        resourceType: log.resource_type as AuditResourceType,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        sessionId: log.session_id,
        metadata: log.metadata,
        createdAt: log.created_at!
      }));

    } catch (error) {
      logger.error('Error searching audit logs:', error);
      return [];
    }
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(
    filters: AuditLogFilters = {},
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const logs = await this.getAuditLogs({ ...filters, limit: 10000 });

      if (format === 'csv') {
        return this.convertToCSV(logs);
      }

      return JSON.stringify(logs, null, 2);

    } catch (error) {
      logger.error('Error exporting audit logs:', error);
      return '';
    }
  }

  /**
   * Convert audit logs to CSV format
   */
  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'ID',
      'Organization ID',
      'User ID',
      'Action Type',
      'Resource Type',
      'Resource ID',
      'Old Values',
      'New Values',
      'IP Address',
      'User Agent',
      'Session ID',
      'Metadata',
      'Created At'
    ];

    const rows = logs.map(log => [
      log.id,
      log.orgId || '',
      log.userId || '',
      log.actionType,
      log.resourceType,
      log.resourceId || '',
      JSON.stringify(log.oldValues || {}),
      JSON.stringify(log.newValues || {}),
      log.ipAddress || '',
      log.userAgent || '',
      log.sessionId || '',
      JSON.stringify(log.metadata || {}),
      log.createdAt
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        orgId: data.org_id,
        userId: data.user_id,
        actionType: data.action_type as AuditActionType,
        resourceType: data.resource_type as AuditResourceType,
        resourceId: data.resource_id,
        oldValues: data.old_values,
        newValues: data.new_values,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        sessionId: data.session_id,
        metadata: data.metadata,
        createdAt: data.created_at!
      };

    } catch (error) {
      logger.error('Error getting audit log by ID:', error);
      return null;
    }
  }

  /**
   * Clean up old audit logs (for compliance retention policies)
   */
  async cleanupOldAuditLogs(retentionDays: number = 2555): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { data, error } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        logger.error('Failed to cleanup old audit logs:', error);
        return 0;
      }

      return data?.length || 0;

    } catch (error) {
      logger.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();

// Convenience functions for common audit events
export const auditEvents = {
  userInvited: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'user_invited', resourceType: 'user_invitation' }),

  userAcceptedInvitation: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'user_accepted_invitation', resourceType: 'user_invitation' }),

  loginSuccess: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'login_success', resourceType: 'user' }),

  loginFailed: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'login_failed', resourceType: 'user' }),

  userRoleChanged: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'user_role_changed', resourceType: 'user' }),

  organizationCreated: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'organization_created', resourceType: 'organization' }),

  subscriptionChanged: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'subscription_changed', resourceType: 'subscription' }),

  avatarCreated: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'avatar_created', resourceType: 'avatar' }),

  gameSessionStarted: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'game_session_started', resourceType: 'game_session' }),

  gameSessionCompleted: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'game_session_completed', resourceType: 'game_session' }),

  settingsChanged: (params: Omit<AuditEventParams, 'actionType' | 'resourceType'>) =>
    auditService.logEvent({ ...params, actionType: 'settings_changed', resourceType: 'user' })
}; 