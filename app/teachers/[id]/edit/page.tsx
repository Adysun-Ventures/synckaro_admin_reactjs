'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Toggle } from '@/components/common/Toggle';
import { isAuthenticated } from '@/services/authService';
import { Teacher } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: 'active' | 'inactive';
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  status?: string;
}

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  const { userId, isLoading: authLoading } = useAuth();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    status: 'active',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load teacher data
  const loadTeacher = useCallback(async () => {
    if (!isAuthenticated() || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const teacherIdNum = parseInt(teacherId, 10);
      if (isNaN(teacherIdNum)) {
        throw new Error('Invalid teacher ID');
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          teacher_id: number;
          name: string;
          status: string;
          email: string;
          phone?: string;
          joined_on: string | null;
          last_updated: string;
          specialization?: string;
          summary: {
            total_students: number;
            total_trades: number;
            total_capital: string;
            win_rate: string;
          };
          associated_students: Array<any>;
          recent_trades: Array<any>;
        };
      }>('/admin/teacher/view', {
        teacher_id: teacherIdNum,
        admin_id: userId,
      });

      if (response.data && response.data.success && response.data.data) {
        const apiData = response.data.data;
        const mappedTeacher: Teacher = {
          id: String(apiData.teacher_id),
          name: apiData.name,
          email: apiData.email,
          mobile: apiData.phone?.replace(/[^0-9]/g, '') || '',
          phone: apiData.phone,
          doj: apiData.joined_on || new Date().toISOString(),
          status: apiData.status as Teacher['status'],
          totalStudents: apiData.summary.total_students || 0,
          totalTrades: apiData.summary.total_trades || 0,
          joinedDate: apiData.joined_on || new Date().toISOString(),
          specialization: apiData.specialization,
        };

        setTeacher(mappedTeacher);
        // Map status to active/inactive (since API might return other statuses)
        const status = apiData.status === 'active' || apiData.status === 'live' || apiData.status === 'open' 
          ? 'active' 
          : 'inactive';

        setFormData({
          name: apiData.name,
          email: apiData.email,
          phone: apiData.phone || '',
          specialization: apiData.specialization || '',
          status: status as 'active' | 'inactive',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching teacher:', err);
      setError(err?.error || err?.message || 'Failed to fetch teacher');
    } finally {
      setLoading(false);
    }
  }, [teacherId, userId, router]);

  useEffect(() => {
    if (!authLoading && userId) {
      loadTeacher();
    }
  }, [loadTeacher, authLoading, userId]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone.trim() && !/^\+?\d{10,15}$/.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
      errors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const teacherIdNum = parseInt(teacherId, 10);
      if (isNaN(teacherIdNum)) {
        throw new Error('Invalid teacher ID');
      }

      // API endpoint: PUT /admin/teacher/update/{teacher_id}
      // Request body: { "name": string, "email": string, "phone"?: string, "specialization"?: string, "status"?: string }
      // Response: { "status": string, "message": string }
      const response = await apiClient.put<{
        status: string;
        message: string;
      }>(`/admin/teacher/update/${teacherIdNum}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        specialization: formData.specialization.trim() || null,
        status: formData.status,
      });

      if (response.data && response.data.status && response.data.message) {
        // Redirect back to teacher profile page
        router.push(`/teachers/${teacherId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to update teacher');
      }
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      setError(err?.error || err?.message || 'Failed to update teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | 'active' | 'inactive') => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout title={teacher ? `Edit ${teacher.name}` : 'Edit Teacher'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/teachers/${teacherId}`}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Edit Teacher</h2>
          </div>

          <div className="w-32" /> {/* Spacer for alignment */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p className="text-sm text-neutral-600">Loading teacher data...</p>
            </div>
          </Card>
        )}

        {/* Edit Form */}
        {!loading && teacher && (
          <form onSubmit={handleSubmit}>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Teacher Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={formErrors.name}
                      required
                      placeholder="Enter teacher name"
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={formErrors.email}
                      required
                      placeholder="teacher@example.com"
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      error={formErrors.phone}
                      placeholder="+91-1234567890"
                      helperText="Optional: Format: +91-XXXXXXXXXX or 10-15 digits"
                    />

                    <Input
                      label="Specialization"
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      error={formErrors.specialization}
                      placeholder="e.g., Intraday Trading, Swing Trading"
                      helperText="Optional: Trading specialization or expertise area"
                    />

                    <div className="w-full">
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Status <span className="text-danger-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
                        className={`w-full px-3 py-2 text-neutral-700 bg-white border rounded-lg transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                          formErrors.status
                            ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
                            : 'border-neutral-300 focus:ring-primary-600 focus:border-primary-600'
                        } disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed`}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {formErrors.status && (
                        <p className="mt-1.5 text-sm text-danger-600">{formErrors.status}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
                  <Link href={`/teachers/${teacherId}`}>
                    <Button type="button" variant="secondary" disabled={saving}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" loading={saving} disabled={saving}>
                    <CheckIcon className="h-4 w-4 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

