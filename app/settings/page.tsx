'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Toggle } from '@/components/common/Toggle';
import { Card } from '@/components/common/Card';
import { isAuthenticated, getCurrentUser } from '@/services/authService';

export default function SettingsPage() {
  const router = useRouter();
  const user = getCurrentUser();

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [dataRefreshInterval, setDataRefreshInterval] = useState('30');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isAuthenticated()) {
    return null;
  }

  const handleSave = () => {
    // In production, this would save to backend
    // For now, just show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Profile Settings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Input
                label="Name"
                value={user?.name || 'Admin'}
                disabled
                readOnly
              />
            </div>
            <div>
              <Input
                label="Email"
                type="email"
                value={user?.email || 'admin@synckaro.com'}
                disabled
                readOnly
              />
            </div>
            <div>
              <Input
                label="Mobile"
                type="tel"
                value={user?.mobile || '9999999999'}
                disabled
                readOnly
              />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Notification Preferences</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">Email Notifications</h3>
                <p className="text-sm text-neutral-500">Receive email updates about platform activity</p>
              </div>
              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">SMS Notifications</h3>
                <p className="text-sm text-neutral-500">Receive SMS alerts for important events</p>
              </div>
              <Toggle
                enabled={smsNotifications}
                onChange={setSmsNotifications}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">Trade Alerts</h3>
                <p className="text-sm text-neutral-500">Get notified when trades are executed</p>
              </div>
              <Toggle
                enabled={tradeAlerts}
                onChange={setTradeAlerts}
              />
            </div>
          </div>
        </Card>

        {/* Platform Settings */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Platform Settings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="block text-xs uppercase tracking-wide text-neutral-500">
                Data Refresh Interval
              </label>
              <select
                value={dataRefreshInterval}
                onChange={(e) => setDataRefreshInterval(e.target.value)}
                className="w-full h-10 px-3 text-sm font-semibold text-neutral-900 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-xs uppercase tracking-wide text-neutral-500">
                Default View
              </label>
              <select
                className="w-full h-10 px-3 text-sm font-semibold text-neutral-900 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="dashboard">Dashboard</option>
                <option value="teachers">Teachers</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-xs uppercase tracking-wide text-neutral-500">
                Theme
              </label>
              <select
                disabled
                className="w-full h-10 px-3 text-sm font-semibold text-neutral-500 border border-neutral-300 rounded-lg bg-neutral-50 cursor-not-allowed"
              >
                <option value="light">Light (Coming Soon: Dark Mode)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave}>
            Save Changes
          </Button>
          {saveSuccess && (
            <span className="text-sm text-success-600 font-medium">
              ✓ Settings saved successfully
            </span>
          )}
        </div>

        {/* Danger Zone */}
        <Card tone="danger" padding="lg">
          <h2 className="text-lg font-semibold text-danger-900 mb-2">Danger Zone</h2>
          <p className="text-sm text-danger-700 mb-4">
            Proceed with caution. These actions are irreversible.
          </p>
          <Button variant="danger" size="sm" disabled>
            Clear All Data (Disabled)
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}

