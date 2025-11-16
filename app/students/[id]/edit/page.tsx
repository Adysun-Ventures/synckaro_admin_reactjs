'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Toggle } from '@/components/common/Toggle';
import { isAuthenticated } from '@/services/authService';
import { Student, Teacher } from '@/types';
import apiClient from '@/lib/api';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  email: string;
  mobile: string;
  teacherId: string;
  status: 'active' | 'inactive';
  initialCapital: number;
  currentCapital: number;
  riskPercentage: number;
  strategy: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  teacherId?: string;
  initialCapital?: string;
  currentCapital?: string;
  riskPercentage?: string;
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    teacherId: '',
    status: 'active',
    initialCapital: 0,
    currentCapital: 0,
    riskPercentage: 0,
    strategy: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load student data
  const loadStudent = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const studentIdNum = parseInt(studentId, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID');
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          student_id: number;
          student_name: string;
          email: string;
          mobile: string;
          status: string;
          teacher_id: number;
          teacher_name: string;
          initial_capital: number;
          current_capital: number;
          risk_percent: number;
          strategy?: string;
          joined_on: string | null;
          last_updated: string;
        };
      }>('/admin/student/view', {
        student_id: studentIdNum,
      });

      if (response.data && response.data.success && response.data.data) {
        const apiData = response.data.data;
        const mappedStudent: Student = {
          id: String(apiData.student_id),
          name: apiData.student_name,
          email: apiData.email,
          mobile: apiData.mobile,
          teacherId: String(apiData.teacher_id),
          teacherName: apiData.teacher_name,
          status: apiData.status as 'active' | 'inactive',
          initialCapital: apiData.initial_capital,
          currentCapital: apiData.current_capital,
          profitLoss: apiData.current_capital - apiData.initial_capital,
          riskPercentage: apiData.risk_percent,
          strategy: apiData.strategy || '',
          joinedDate: apiData.joined_on || new Date().toISOString(),
        };

        setStudent(mappedStudent);
        setFormData({
          name: apiData.student_name,
          email: apiData.email,
          mobile: apiData.mobile,
          teacherId: String(apiData.teacher_id),
          status: apiData.status as 'active' | 'inactive',
          initialCapital: apiData.initial_capital,
          currentCapital: apiData.current_capital,
          riskPercentage: apiData.risk_percent,
          strategy: apiData.strategy || '',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching student:', err);
      setError(err?.error || err?.message || 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Load teachers list
  const loadTeachers = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiClient.post<
        Array<{ id: number; name: string; email: string; doj: string; status: string }>
      >('/admin/teacher/list', {
        page: 1,
        limit: 1000, // Get all teachers for dropdown
        search: '',
      });

      if (response.data && Array.isArray(response.data)) {
        const mappedTeachers: Teacher[] = response.data.map((teacher) => ({
          id: String(teacher.id),
          name: teacher.name,
          email: teacher.email,
          mobile: '',
          doj: teacher.doj,
          status: teacher.status as Teacher['status'],
          totalStudents: 0,
          totalTrades: 0,
          joinedDate: teacher.doj,
        }));
        setTeachers(mappedTeachers);
      }
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      // Continue even if teachers fetch fails
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      loadStudent();
      loadTeachers();
    }
  }, [loadStudent, loadTeachers]);

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

    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.teacherId) {
      errors.teacherId = 'Please select a teacher';
    }

    if (formData.initialCapital < 0) {
      errors.initialCapital = 'Initial capital cannot be negative';
    }

    if (formData.currentCapital < 0) {
      errors.currentCapital = 'Current capital cannot be negative';
    }

    if (formData.riskPercentage < 0 || formData.riskPercentage > 100) {
      errors.riskPercentage = 'Risk percentage must be between 0 and 100';
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
      const studentIdNum = parseInt(studentId, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID');
      }

      // API endpoint: PUT /admin/student/update/{id}
      // Request body: { "name": string, "email": string, "mobile": string, ... }
      // Response: { "status": boolean, "message": string }
      const response = await apiClient.put<{
        status: boolean;
        message?: string;
      }>(`/admin/student/update/${studentIdNum}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        teacher_id: parseInt(formData.teacherId, 10),
        status: formData.status,
        initial_capital: formData.initialCapital,
        current_capital: formData.currentCapital,
        risk_percent: formData.riskPercentage,
        strategy: formData.strategy.trim() || null,
      });

      if (response.data && response.data.status) {
        // Redirect back to student profile page on success
        router.push(`/students/${studentId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to update student');
      }
    } catch (err: any) {
      console.error('Error updating student:', err);
      setError(err?.error || err?.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
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
    <DashboardLayout title="Edit Student Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/students/${studentId}`}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Edit Student Profile</h2>
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
              <p className="text-sm text-neutral-600">Loading student data...</p>
            </div>
          </Card>
        )}

        {/* Edit Form */}
        {!loading && student && (
          <form onSubmit={handleSubmit}>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Student Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={formErrors.name}
                      required
                      placeholder="Enter student name"
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={formErrors.email}
                      required
                      placeholder="student@example.com"
                    />

                    <Input
                      label="Mobile Number"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                      error={formErrors.mobile}
                      required
                      placeholder="1234567890"
                      maxLength={10}
                    />

                    <div className="w-full">
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Teacher <span className="text-danger-500">*</span>
                      </label>
                      <select
                        value={formData.teacherId}
                        onChange={(e) => handleChange('teacherId', e.target.value)}
                        className={`w-full px-3 py-2 text-neutral-700 bg-white border rounded-lg transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                          formErrors.teacherId
                            ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
                            : 'border-neutral-300 focus:ring-primary-600 focus:border-primary-600'
                        } disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed`}
                        required
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.teacherId && (
                        <p className="mt-1.5 text-sm text-danger-600">{formErrors.teacherId}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Trading Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Initial Capital (₹)"
                      type="number"
                      value={formData.initialCapital}
                      onChange={(e) => handleChange('initialCapital', parseFloat(e.target.value) || 0)}
                      error={formErrors.initialCapital}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />

                    <Input
                      label="Current Capital (₹)"
                      type="number"
                      value={formData.currentCapital}
                      onChange={(e) => handleChange('currentCapital', parseFloat(e.target.value) || 0)}
                      error={formErrors.currentCapital}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />

                    <Input
                      label="Risk Percentage (%)"
                      type="number"
                      value={formData.riskPercentage}
                      onChange={(e) => handleChange('riskPercentage', parseFloat(e.target.value) || 0)}
                      error={formErrors.riskPercentage}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Additional Information</h3>
                  <div className="space-y-6">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Strategy
                      </label>
                      <textarea
                        value={formData.strategy}
                        onChange={(e) => handleChange('strategy', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-600 focus:border-primary-600 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed resize-vertical"
                        placeholder="Enter trading strategy or notes..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-700">Status</span>
                      <Toggle
                        enabled={formData.status === 'active'}
                        onChange={(enabled) => handleChange('status', enabled ? 'active' : 'inactive')}
                      />
                      <span className="text-sm text-neutral-600">
                        {formData.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
                  <Link href={`/students/${studentId}`}>
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

