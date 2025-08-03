
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { Suspense } from 'react';

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <Suspense fallback={<div>Loading...</div>}>
         <OnboardingForm />
      </Suspense>
    </div>
  );
}
