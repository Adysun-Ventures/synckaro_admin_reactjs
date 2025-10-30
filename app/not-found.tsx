import Link from 'next/link';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning-100">
          <QuestionMarkCircleIcon className="h-8 w-8 text-warning-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
          Page Not Found
        </h2>
        
        <p className="text-neutral-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or return to the dashboard.
        </p>
        
        <Link href="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

