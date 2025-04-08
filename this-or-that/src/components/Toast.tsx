"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

/**
 * A toast notification component
 */
export default function Toast({ 
  message, 
  show, 
  onClose, 
  duration = 2000 
}: ToastProps) {
  
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  if (!show) return null;
  
  return (
    <div>
      {message}
    </div>
  );
} 