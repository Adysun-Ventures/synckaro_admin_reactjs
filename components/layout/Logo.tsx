import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
        <span className="text-xl font-bold text-white">$</span>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-neutral-900">SyncKaro</span>
        <span className="text-xs text-neutral-500">Copy Trading</span>
      </div>
    </Link>
  );
}

