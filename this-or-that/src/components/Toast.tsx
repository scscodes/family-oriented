"use client";

import { useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
  severity?: "success" | "error" | "info" | "warning";
}

/**
 * A toast notification component that displays messages using Material-UI's Snackbar
 * @param message - The message to display
 * @param show - Whether the toast should be visible
 * @param onClose - Callback function when the toast is closed
 * @param duration - How long the toast should stay visible (in ms)
 * @param severity - The type/severity of the message (affects color and icon)
 */
export default function Toast({ 
  message, 
  show, 
  onClose, 
  duration = 2000,
  severity = "success"
}: ToastProps) {
  
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  return (
    <Snackbar
      open={show}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
} 