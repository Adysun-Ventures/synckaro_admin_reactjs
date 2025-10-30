'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { isAuthenticated, getCurrentUser } from '@/services/authService';

export default function ProfilePage() {
  const router = useRouter();
  const user = getCurrentUser();

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated() || !user) {
    return null;
  }

  // Dummy recent activity
  const recentActivity = [
    { action: 'Logged in', timestamp: new Date().toISOString(), location: 'Mumbai, India' },
    { action: 'Viewed teacher details', timestamp: new Date(Date.now() - 3600000).toISOString(), location: 'Mumbai, India' },
    { action: 'Deleted teacher', timestamp: new Date(Date.now() - 7200000).toISOString(), location: 'Mumbai, India' },
    { action: 'Logged in', timestamp: new Date(Date.now() - 86400000).toISOString(), location: 'Mumbai, India' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-4xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-4 rounded-full">
                <UserCircleIcon className="h-16 w-16" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-primary-100">Administrator</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-neutral-100 p-2 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Email Address</p>
                  <p className="font-medium text-neutral-900">{user.email || 'admin@synckaro.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-neutral-100 p-2 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Mobile Number</p>
                  <p className="font-medium text-neutral-900">{user.mobile}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-neutral-100 p-2 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Account Created</p>
                  <p className="font-medium text-neutral-900">{formatDate(new Date(2024, 0, 1).toISOString())}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-neutral-100 p-2 rounded-lg">
                  <UserCircleIcon className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Role</p>
                  <p className="font-medium text-neutral-900 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <Button onClick={() => router.push('/settings')}>
                Edit Profile Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
            <span className="text-sm text-neutral-500">Last 24 hours</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{activity.action}</p>
                  <p className="text-sm text-neutral-500">
                    {activity.location} • {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500 mb-1">Platform Since</p>
            <p className="text-2xl font-semibold text-neutral-900">Jan 2024</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500 mb-1">Total Logins</p>
            <p className="text-2xl font-semibold text-neutral-900">127</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500 mb-1">Last Login</p>
            <p className="text-2xl font-semibold text-neutral-900">Today</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

