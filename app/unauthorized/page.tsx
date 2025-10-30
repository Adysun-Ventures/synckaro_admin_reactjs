import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
          <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
        </div>
        
        <h1 className="text-3xl font-semibold text-neutral-900 mb-3">
          Access Denied
        </h1>
        
        <p className="text-neutral-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <Link href="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

