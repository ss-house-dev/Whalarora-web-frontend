import Welcome from '@/features/welcome/components/Welcome';
import { Suspense } from 'react';

export default function WelcomePage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Welcome />
      </Suspense>
    </div>
  );
}
