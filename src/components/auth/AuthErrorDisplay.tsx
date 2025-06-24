'use client';

import React from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  ContactSupport,
  Refresh,
  Login,
  Email,
  VpnKey,
} from '@mui/icons-material';
import { 
  parseAuthError, 
  getErrorMessage, 
  getRequiredAction, 
  requiresSupportContact,
  AuthErrorInfo,
} from '@/utils/authErrors';

interface AuthErrorDisplayProps {
  /** The error to display */
  error: unknown;
  /** Optional title override */
  title?: string;
  /** Whether to show detailed error information (for debugging) */
  showDetails?: boolean;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Callback for redirect to login */
  onRedirectToLogin?: () => void;
  /** Callback for email verification action */
  onResendVerification?: () => void;
  /** Callback for password reset action */
  onPasswordReset?: () => void;
  /** Callback for contact support action */
  onContactSupport?: () => void;
  /** Whether retry action is currently loading */
  retryLoading?: boolean;
  /** Additional custom actions */
  customActions?: React.ReactNode;
  /** Whether to auto-hide detailed info */
  collapsible?: boolean;
}

export default function AuthErrorDisplay({
  error,
  title,
  showDetails = false,
  onRetry,
  onRedirectToLogin,
  onResendVerification,
  onPasswordReset,
  onContactSupport,
  retryLoading = false,
  customActions,
  collapsible = true,
}: AuthErrorDisplayProps) {
  const [detailsExpanded, setDetailsExpanded] = React.useState(!collapsible);
  
  if (!error) return null;

  const errorInfo: AuthErrorInfo = parseAuthError(error);
  const userMessage = getErrorMessage(error);
  const requiredAction = getRequiredAction(error);
  const needsSupport = requiresSupportContact(error);

  // Determine alert severity
  const severity = errorInfo.severity;

  // Generate appropriate title
  const alertTitle = title || (() => {
    switch (errorInfo.type) {
      case 'invalid_credentials':
        return 'Invalid Credentials';
      case 'email_not_confirmed':
        return 'Email Not Verified';
      case 'rate_limit_exceeded':
        return 'Too Many Attempts';
      case 'network_error':
        return 'Connection Error';
      case 'weak_password':
        return 'Password Requirements';
      case 'email_already_registered':
        return 'Account Exists';
      case 'account_suspended':
        return 'Account Suspended';
      case 'token_expired':
        return 'Link Expired';
      case 'token_invalid':
        return 'Invalid Link';
      default:
        return 'Authentication Error';
    }
  })();

  // Generate action buttons based on error type and required action
  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    // Required action buttons
    switch (requiredAction) {
      case 'verify_email':
        if (onResendVerification) {
          buttons.push(
            <Button
              key="verify"
              variant="contained"
              size="small"
              startIcon={<Email />}
              onClick={onResendVerification}
              disabled={retryLoading}
            >
              Resend Verification Email
            </Button>
          );
        }
        break;

      case 'redirect_to_login':
        if (onRedirectToLogin) {
          buttons.push(
            <Button
              key="login"
              variant="contained"
              size="small"
              startIcon={<Login />}
              onClick={onRedirectToLogin}
            >
              Go to Login
            </Button>
          );
        }
        break;

      case 'resend_email':
        if (onResendVerification) {
          buttons.push(
            <Button
              key="resend"
              variant="contained"
              size="small"
              startIcon={<Email />}
              onClick={onResendVerification}
              disabled={retryLoading}
            >
              Request New Link
            </Button>
          );
        }
        break;
    }

    // General retry button for retryable errors
    if (errorInfo.retryable && onRetry && !requiredAction) {
      buttons.push(
        <Button
          key="retry"
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRetry}
          disabled={retryLoading}
        >
          {retryLoading ? 'Retrying...' : 'Try Again'}
        </Button>
      );
    }

    // Password reset button for credential errors
    if (errorInfo.type === 'invalid_credentials' && onPasswordReset) {
      buttons.push(
        <Button
          key="reset"
          variant="text"
          size="small"
          startIcon={<VpnKey />}
          onClick={onPasswordReset}
        >
          Reset Password
        </Button>
      );
    }

    // Support contact button
    if (needsSupport && onContactSupport) {
      buttons.push(
        <Button
          key="support"
          variant="text"
          size="small"
          startIcon={<ContactSupport />}
          onClick={onContactSupport}
          color="inherit"
        >
          Contact Support
        </Button>
      );
    }

    // Custom actions
    if (customActions) {
      buttons.push(customActions);
    }

    return buttons;
  };

  const actionButtons = getActionButtons();

  return (
    <Alert 
      severity={severity}
      variant="outlined"
      sx={{ width: '100%' }}
    >
      <AlertTitle>{alertTitle}</AlertTitle>
      
      <Typography variant="body2" sx={{ mb: actionButtons.length > 0 ? 2 : 0 }}>
        {userMessage}
      </Typography>

      {/* Action buttons */}
      {actionButtons.length > 0 && (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: actionButtons.length > 2 ? 'repeat(2, 1fr)' : `repeat(${actionButtons.length}, 1fr)` 
            },
            gap: 1,
            mb: showDetails && collapsible ? 1 : 0,
          }}
        >
          {actionButtons}
        </Box>
      )}

      {/* Detailed error information (for debugging) */}
      {showDetails && (
        <Box sx={{ mt: 1 }}>
          {collapsible && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                mb: 1,
              }}
              onClick={() => setDetailsExpanded(!detailsExpanded)}
            >
              <Typography variant="caption" sx={{ mr: 0.5 }}>
                Error Details
              </Typography>
              <IconButton size="small" sx={{ p: 0.25 }}>
                {detailsExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          )}
          
          <Collapse in={detailsExpanded}>
            <Box 
              sx={{ 
                backgroundColor: 'action.hover',
                p: 1.5,
                borderRadius: 1,
                fontFamily: 'monospace',
              }}
            >
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                <strong>Error Type:</strong> {errorInfo.type}
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                <strong>Message:</strong> {errorInfo.message}
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                <strong>Retryable:</strong> {errorInfo.retryable ? 'Yes' : 'No'}
              </Typography>
              {errorInfo.actionRequired && (
                <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                  <strong>Required Action:</strong> {errorInfo.actionRequired}
                </Typography>
              )}
              {needsSupport && (
                <Typography variant="caption" component="div">
                  <strong>Support Contact:</strong> Required
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      )}
    </Alert>
  );
}

/**
 * Simplified error display for inline use
 */
export function InlineAuthError({ 
  error, 
  onRetry, 
  retryLoading = false 
}: {
  error: unknown;
  onRetry?: () => void;
  retryLoading?: boolean;
}) {
  if (!error) return null;

  const userMessage = getErrorMessage(error);
  const errorInfo = parseAuthError(error);

  return (
    <Alert 
      severity={errorInfo.severity} 
      variant="standard"
      sx={{ mt: 2 }}
      action={
        errorInfo.retryable && onRetry ? (
          <Button 
            color="inherit" 
            size="small" 
            onClick={onRetry}
            disabled={retryLoading}
          >
            {retryLoading ? 'Retrying...' : 'Retry'}
          </Button>
        ) : undefined
      }
    >
      {userMessage}
    </Alert>
  );
} 