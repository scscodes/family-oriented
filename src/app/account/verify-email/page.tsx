import React, { Suspense } from 'react';
import { EmailVerificationHandler } from './EmailVerificationHandler';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationHandler />
    </Suspense>
  );
} 