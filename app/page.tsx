'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserGroupIcon, AcademicCapIcon, ChartBarIcon, BoltIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { isAuthenticated, getCurrentUser } from '@/services/authService';

export default function DashboardPage() {
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  const stats = [
    {
      name: 'Total Teachers',
      value: '24',
      icon: AcademicCapIcon,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      name: 'Total Students',
      value: '542',
      icon: UserGroupIcon,
      bgColor: 'bg-success-100',
      iconColor: 'text-success-600',
    },
    {
      name: 'Total Trades',
      value: '1,247',
      icon: ChartBarIcon,
      bgColor: 'bg-warning-100',
      iconColor: 'text-warning-600',
    },
    {
      name: 'Active Users',
      value: '489',
      icon: BoltIcon,
      bgColor: 'bg-danger-100',
      iconColor: 'text-danger-600',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Card */}
      <div className="bg-primary-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h2>
        <p className="text-primary-100">
          Here's what's happening with your platform today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-neutral-500 mb-1">{stat.name}</p>
            <p className="text-3xl font-semibold text-neutral-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { teacher: 'John Doe', action: 'executed a trade', time: '2 minutes ago' },
            { teacher: 'Jane Smith', action: 'added a new student', time: '15 minutes ago' },
            { teacher: 'Mike Johnson', action: 'updated profile', time: '1 hour ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {activity.teacher}
                </p>
                <p className="text-sm text-neutral-500">{activity.action}</p>
              </div>
              <span className="text-xs text-neutral-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
