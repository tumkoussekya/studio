import { SignUpForm } from '@/components/auth/SignUpForm';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
