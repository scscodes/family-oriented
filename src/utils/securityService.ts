import { createClient } from '@/lib/supabase/client';
import { logger } from './logger';
import { auditService } from './auditService';

export interface RateLimitConfig {
  windowMinutes: number;
  maxAttempts: number;
  actionType: string;
}

export interface SecurityEvent {
  type: 'rate_limit_exceeded' | 'suspicious_activity' | 'failed_login' | 'unusual_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  identifier: string;
  identifierType: 'email' | 'ip' | 'user_id';
  actionType: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  identifier: string;
  identifierType: string;
  actionType: string;
  details: Record<string, any>;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface SecurityStats {
  totalEvents: number;
  eventsBySeverity: Record<string, number>;
  eventsByType: Record<string, number>;
  recentAlerts: SecurityAlert[];
  rateLimitViolations: number;
  suspiciousActivities: number;
}

class SecurityService {
  private supabase = createClient();

  // Default rate limit configurations
  private readonly defaultRateLimits: Record<string, RateLimitConfig> = {
    login: { windowMinutes: 15, maxAttempts: 5, actionType: 'login' },
    invitation: { windowMinutes: 60, maxAttempts: 10, actionType: 'invitation' },
    registration: { windowMinutes: 60, maxAttempts: 3, actionType: 'registration' },
    password_reset: { windowMinutes: 60, maxAttempts: 3, actionType: 'password_reset' },
    api_request: { windowMinutes: 1, maxAttempts: 100, actionType: 'api_request' },
    email_verification: { windowMinutes: 15, maxAttempts: 5, actionType: 'email_verification' }
  };

  /**
   * Check rate limit for an action
   */
  async checkRateLimit(
    identifier: string,
    identifierType: 'email' | 'ip' | 'user_id',
    actionType: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<{ allowed: boolean; remaining: number; resetTime: string }> {
    try {
      const config = {
        ...this.defaultRateLimits[actionType],
        ...customConfig
      };

      if (!config) {
        logger.warn(`No rate limit config found for action: ${actionType}`);
        return { allowed: true, remaining: 999, resetTime: new Date().toISOString() };
      }

      const { data, error } = await this.supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_identifier_type: identifierType,
        p_action_type: actionType,
        p_window_minutes: config.windowMinutes,
        p_max_attempts: config.maxAttempts
      });

      if (error) {
        logger.error('Rate limit check failed:', error);
        return { allowed: true, remaining: 999, resetTime: new Date().toISOString() };
      }

      const allowed = data as boolean;

      // Calculate remaining attempts and reset time
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);
      
      const { data: currentCount } = await this.supabase
        .from('rate_limits')
        .select('count')
        .eq('identifier', identifier)
        .eq('identifier_type', identifierType)
        .eq('action_type', actionType)
        .eq('window_start', windowStart.toISOString())
        .single();

      const remaining = Math.max(0, config.maxAttempts - (currentCount?.count || 0));
      const resetTime = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000).toISOString();

      // Log security event if rate limit exceeded
      if (!allowed) {
        await this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          identifier,
          identifierType,
          actionType,
          details: {
            windowMinutes: config.windowMinutes,
            maxAttempts: config.maxAttempts,
            currentCount: currentCount?.count || 0
          },
          timestamp: new Date().toISOString()
        });
      }

      return { allowed, remaining, resetTime };

    } catch (error) {
      logger.error('Error checking rate limit:', error);
      return { allowed: true, remaining: 999, resetTime: new Date().toISOString() };
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(
    identifier: string,
    identifierType: 'email' | 'ip' | 'user_id',
    actionType: string,
    context: Record<string, any> = {}
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    try {
      const reasons: string[] = [];
      let suspicious = false;

      // Check for rapid successive actions
      const recentActions = await this.getRecentActions(identifier, identifierType, 5);
      if (recentActions.length >= 5) {
        const timeSpan = new Date().getTime() - new Date(recentActions[0].created_at).getTime();
        const actionsPerMinute = (recentActions.length / timeSpan) * 60000;
        
        if (actionsPerMinute > 10) {
          suspicious = true;
          reasons.push('High frequency of actions');
        }
      }

      // Check for failed login attempts
      if (actionType === 'login_failed') {
        const failedLogins = await this.getRecentActions(identifier, identifierType, 10, 'login_failed');
        if (failedLogins.length >= 3) {
          suspicious = true;
          reasons.push('Multiple failed login attempts');
        }
      }

      // Check for unusual IP patterns
      if (identifierType === 'user_id' && context.ipAddress) {
        const userIPs = await this.getUserIPs(identifier, 24); // Last 24 hours
        if (userIPs.length > 5) {
          suspicious = true;
          reasons.push('Multiple IP addresses used');
        }
      }

      // Check for unusual time patterns
      const hour = new Date().getHours();
      if (hour < 6 || hour > 23) {
        if (actionType === 'login_success') {
          suspicious = true;
          reasons.push('Login during unusual hours');
        }
      }

      // Log suspicious activity
      if (suspicious) {
        await this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          identifier,
          identifierType,
          actionType,
          details: {
            reasons,
            context,
            recentActions: recentActions.length
          },
          timestamp: new Date().toISOString()
        });
      }

      return { suspicious, reasons };

    } catch (error) {
      logger.error('Error detecting suspicious activity:', error);
      return { suspicious: false, reasons: [] };
    }
  }

  /**
   * Log security events
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to audit system
      await auditService.logEvent({
        actionType: event.type as any,
        resourceType: 'user',
        resourceId: event.identifierType === 'user_id' ? event.identifier : undefined,
        metadata: {
          securityEvent: true,
          severity: event.severity,
          identifierType: event.identifierType,
          actionType: event.actionType,
          details: event.details
        }
      });

      // Create security alert for high severity events
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.createSecurityAlert(event);
      }

      logger.warn('Security event logged:', event);

    } catch (error) {
      logger.error('Error logging security event:', error);
    }
  }

  /**
   * Create security alert
   */
  private async createSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      const alertData = {
        event_type: event.type,
        severity: event.severity,
        title: this.getAlertTitle(event),
        description: this.getAlertDescription(event),
        identifier: event.identifier,
        identifier_type: event.identifierType,
        action_type: event.actionType,
        details: event.details,
        is_resolved: false,
        created_at: new Date().toISOString()
      };

      // Note: This would require a security_alerts table
      // For now, we'll just log it
      logger.error('SECURITY ALERT:', alertData);

    } catch (error) {
      logger.error('Error creating security alert:', error);
    }
  }

  /**
   * Get alert title based on event type
   */
  private getAlertTitle(event: SecurityEvent): string {
    switch (event.type) {
      case 'rate_limit_exceeded':
        return `Rate Limit Exceeded - ${event.actionType}`;
      case 'suspicious_activity':
        return `Suspicious Activity Detected`;
      case 'failed_login':
        return `Multiple Failed Login Attempts`;
      case 'unusual_access':
        return `Unusual Access Pattern`;
      default:
        return `Security Event - ${event.type}`;
    }
  }

  /**
   * Get alert description based on event type
   */
  private getAlertDescription(event: SecurityEvent): string {
    switch (event.type) {
      case 'rate_limit_exceeded':
        return `Rate limit exceeded for ${event.identifierType} "${event.identifier}" performing ${event.actionType}`;
      case 'suspicious_activity':
        return `Suspicious activity detected for ${event.identifierType} "${event.identifier}": ${event.details.reasons?.join(', ')}`;
      case 'failed_login':
        return `Multiple failed login attempts detected for ${event.identifierType} "${event.identifier}"`;
      case 'unusual_access':
        return `Unusual access pattern detected for ${event.identifierType} "${event.identifier}"`;
      default:
        return `Security event of type ${event.type} detected for ${event.identifierType} "${event.identifier}"`;
    }
  }

  /**
   * Get recent actions for an identifier
   */
  private async getRecentActions(
    identifier: string,
    identifierType: string,
    limit: number,
    actionType?: string
  ): Promise<any[]> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', identifier)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get recent actions:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      logger.error('Error getting recent actions:', error);
      return [];
    }
  }

  /**
   * Get IP addresses used by a user
   */
  private async getUserIPs(userId: string, hours: number): Promise<string[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);

      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('ip_address')
        .eq('user_id', userId)
        .gte('created_at', cutoffTime.toISOString())
        .not('ip_address', 'is', null);

      if (error) {
        logger.error('Failed to get user IPs:', error);
        return [];
      }

      return [...new Set(data?.map(log => log.ip_address).filter(Boolean))];

    } catch (error) {
      logger.error('Error getting user IPs:', error);
      return [];
    }
  }

  /**
   * Validate and sanitize user input
   */
  validateInput(input: any, type: 'email' | 'name' | 'phone' | 'url'): { valid: boolean; sanitized?: string; error?: string } {
    try {
      if (typeof input !== 'string') {
        return { valid: false, error: 'Input must be a string' };
      }

      const sanitized = input.trim();

      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(sanitized)) {
            return { valid: false, error: 'Invalid email format' };
          }
          break;

        case 'name':
          if (sanitized.length < 1 || sanitized.length > 100) {
            return { valid: false, error: 'Name must be between 1 and 100 characters' };
          }
          if (!/^[a-zA-Z\s\-'\.]+$/.test(sanitized)) {
            return { valid: false, error: 'Name contains invalid characters' };
          }
          break;

        case 'phone':
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(sanitized.replace(/[\s\-\(\)]/g, ''))) {
            return { valid: false, error: 'Invalid phone number format' };
          }
          break;

        case 'url':
          try {
            new URL(sanitized);
          } catch {
            return { valid: false, error: 'Invalid URL format' };
          }
          break;
      }

      return { valid: true, sanitized };

    } catch (error) {
      logger.error('Error validating input:', error);
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  /**
   * Hash sensitive data
   */
  hashData(data: string, salt?: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const saltedData = salt ? data + salt : data;
    return hash.update(saltedData).digest('hex');
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(orgId?: string, days: number = 30): Promise<SecurityStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .contains('metadata', { securityEvent: true });

      if (error) {
        logger.error('Failed to get security stats:', error);
        return {
          totalEvents: 0,
          eventsBySeverity: {},
          eventsByType: {},
          recentAlerts: [],
          rateLimitViolations: 0,
          suspiciousActivities: 0
        };
      }

      const eventsBySeverity: Record<string, number> = {};
      const eventsByType: Record<string, number> = {};
      let rateLimitViolations = 0;
      let suspiciousActivities = 0;

      events?.forEach(event => {
        const severity = event.metadata?.severity || 'unknown';
        const eventType = event.action_type;

        eventsBySeverity[severity] = (eventsBySeverity[severity] || 0) + 1;
        eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;

        if (eventType === 'rate_limit_exceeded') rateLimitViolations++;
        if (eventType === 'suspicious_activity') suspiciousActivities++;
      });

      return {
        totalEvents: events?.length || 0,
        eventsBySeverity,
        eventsByType,
        recentAlerts: [], // Would be populated from security_alerts table
        rateLimitViolations,
        suspiciousActivities
      };

    } catch (error) {
      logger.error('Error getting security stats:', error);
      return {
        totalEvents: 0,
        eventsBySeverity: {},
        eventsByType: {},
        recentAlerts: [],
        rateLimitViolations: 0,
        suspiciousActivities: 0
      };
    }
  }

  /**
   * Clean up old rate limit records
   */
  async cleanupOldRateLimits(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('cleanup_old_rate_limits');

      if (error) {
        logger.error('Failed to cleanup old rate limits:', error);
        return 0;
      }

      return data || 0;

    } catch (error) {
      logger.error('Error cleaning up old rate limits:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService();

// Convenience functions for common security checks
export const securityChecks = {
  validateEmail: (email: string) => securityService.validateInput(email, 'email'),
  validateName: (name: string) => securityService.validateInput(name, 'name'),
  validatePhone: (phone: string) => securityService.validateInput(phone, 'phone'),
  validateUrl: (url: string) => securityService.validateInput(url, 'url'),
  generateToken: (length?: number) => securityService.generateSecureToken(length),
  hashData: (data: string, salt?: string) => securityService.hashData(data, salt)
}; 