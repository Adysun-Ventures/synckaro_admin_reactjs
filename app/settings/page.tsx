'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Toggle } from '@/components/common/Toggle';
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
      <div className="max-w-4xl space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Profile Settings</h2>
          <div className="space-y-4">
            <Input
              label="Name"
              value={user?.name || 'Admin'}
              disabled
              readOnly
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || 'admin@synckaro.com'}
              disabled
              readOnly
            />
            <Input
              label="Mobile"
              type="tel"
              value={user?.mobile || '9999999999'}
              disabled
              readOnly
            />
            <div className="pt-2">
              <Button variant="secondary" disabled>
                Change Password (Coming Soon)
              </Button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Notification Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">Email Notifications</h3>
                <p className="text-sm text-neutral-500">Receive email updates about platform activity</p>
              </div>
              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">SMS Notifications</h3>
                <p className="text-sm text-neutral-500">Receive SMS alerts for important events</p>
              </div>
              <Toggle
                enabled={smsNotifications}
                onChange={setSmsNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">Trade Alerts</h3>
                <p className="text-sm text-neutral-500">Get notified when trades are executed</p>
              </div>
              <Toggle
                enabled={tradeAlerts}
                onChange={setTradeAlerts}
              />
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Platform Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Data Refresh Interval (seconds)
              </label>
              <select
                value={dataRefreshInterval}
                onChange={(e) => setDataRefreshInterval(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Default View
              </label>
              <select
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="dashboard">Dashboard</option>
                <option value="teachers">Teachers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Theme
              </label>
              <select
                disabled
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
              >
                <option value="light">Light (Coming Soon: Dark Mode)</option>
              </select>
            </div>
          </div>
        </div>

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
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-danger-900 mb-2">Danger Zone</h2>
          <p className="text-sm text-danger-700 mb-4">
            Proceed with caution. These actions are irreversible.
          </p>
          <Button variant="danger" size="sm" disabled>
            Clear All Data (Disabled)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

