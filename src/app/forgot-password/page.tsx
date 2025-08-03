
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Suspense } from 'react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
