-- User Invitations Table
-- Handles organization member invitations with secure token-based system
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roles TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_invitations_org_id ON user_invitations(org_id);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX idx_user_invitations_token_hash ON user_invitations(token_hash);

-- Audit Logs Table
-- Comprehensive audit trail for all user management actions
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'user_invited', 'user_accepted_invitation', 'user_declined_invitation',
    'user_role_changed', 'user_removed', 'user_suspended', 'user_reactivated',
    'invitation_expired', 'invitation_cancelled', 'invitation_resent',
    'login_attempt', 'login_success', 'login_failed', 'logout',
    'password_changed', 'password_reset', 'email_changed',
    'organization_created', 'organization_updated', 'organization_deleted',
    'subscription_changed', 'billing_updated', 'policy_changed'
  )),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Rate Limiting Table
-- Tracks API usage and implements rate limiting
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email, IP, or user_id
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip', 'user_id')),
  action_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, identifier_type, action_type, window_start)
);

-- Indexes for rate limiting
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, identifier_type);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start, window_end);
CREATE INDEX idx_rate_limits_action ON rate_limits(action_type);

-- Enable Row Level Security
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_invitations
-- Organization admins can manage invitations for their org
CREATE POLICY "Organization admins can manage invitations" ON user_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.org_id = user_invitations.org_id
      AND u.account_type = 'organization_admin'
    )
  );

-- Users can view invitations they were invited by
CREATE POLICY "Users can view invitations they created" ON user_invitations
  FOR SELECT USING (
    invited_by = auth.uid()
  );

-- Users can view invitations sent to their email (for accepting)
CREATE POLICY "Users can view invitations sent to their email" ON user_invitations
  FOR SELECT USING (
    email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- RLS Policies for audit_logs
-- Organization admins can view audit logs for their org
CREATE POLICY "Organization admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.org_id = audit_logs.org_id
      AND u.account_type = 'organization_admin'
    )
  );

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- System can insert audit logs (no auth check for inserts)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for rate_limits
-- System can manage rate limits (no auth check)
CREATE POLICY "System can manage rate limits" ON rate_limits
  FOR ALL USING (true);

-- Functions for token generation and validation
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  -- Generate a cryptographically secure random token
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE user_invitations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_org_id UUID,
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    org_id, user_id, action_type, resource_type, resource_id,
    old_values, new_values, ip_address, user_agent, session_id, metadata
  ) VALUES (
    p_org_id, p_user_id, p_action_type, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_ip_address, p_user_agent, p_session_id, p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_action_type TEXT,
  p_window_minutes INTEGER DEFAULT 60,
  p_max_attempts INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
  window_end TIMESTAMPTZ;
BEGIN
  -- Calculate time window
  window_start := date_trunc('minute', NOW() - (p_window_minutes || ' minutes')::INTERVAL);
  window_end := date_trunc('minute', NOW());
  
  -- Get current count for this window
  SELECT COALESCE(count, 0) INTO current_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND action_type = p_action_type
    AND window_start = window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO rate_limits (identifier, identifier_type, action_type, count, window_start, window_end)
  VALUES (p_identifier, p_identifier_type, p_action_type, 1, window_start, window_end)
  ON CONFLICT (identifier, identifier_type, action_type, window_start)
  DO UPDATE SET count = rate_limits.count + 1, updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired invitations and old rate limits
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-invitations', '0 */6 * * *', 'SELECT cleanup_expired_invitations();');
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_old_rate_limits();'); 