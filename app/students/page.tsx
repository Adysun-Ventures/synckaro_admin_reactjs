"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ComponentType,
  type ComponentProps,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaginationFooter } from "@/components/common/PaginationFooter";
import { ConfirmDialog } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { storage } from "@/lib/storage";
import { Student } from "@/types";
import { isAuthenticated } from "@/services/authService";
import apiClient from "@/lib/api";

const PAGE_SIZE_OPTIONS = [50, 100, 200, 300];

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState<
    Student["status"] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Merge API response with localStorage and apply default dummy values
  const mergeStudentsWithLocalStorage = (
    apiStudents: Array<{ id: number; name: string; email: string; mobile: string; status: string; teacher_id: number; teacher_name: string; joined_on: string | null }>
  ): Student[] => {
    const localStorageStudents = (storage.getItem("students") || []) as Student[];

    // Hardcoded default dummy values for optional fields
    const defaultValues = {
      initialCapital: 0,
      currentCapital: 0,
      profitLoss: 0,
      riskPercentage: 0,
      strategy: "",
      joinedDate: new Date().toISOString(),
    };

    return apiStudents.map((apiStudent) => {
      // Find matching student in localStorage by id
      const localStudent = localStorageStudents.find(
        (s) => s.id === String(apiStudent.id)
      );

      // Merge: API data > localStorage data > default dummy values
      return {
        id: String(apiStudent.id), // Convert number to string
        name: apiStudent.name,
        email: apiStudent.email,
        mobile: apiStudent.mobile,
        teacherId: String(apiStudent.teacher_id),
        teacherName: apiStudent.teacher_name,
        status: apiStudent.status as Student["status"],
        initialCapital: localStudent?.initialCapital ?? defaultValues.initialCapital,
        currentCapital: localStudent?.currentCapital ?? defaultValues.currentCapital,
        profitLoss: localStudent?.profitLoss ?? defaultValues.profitLoss,
        riskPercentage: localStudent?.riskPercentage ?? defaultValues.riskPercentage,
        strategy: localStudent?.strategy || defaultValues.strategy,
        joinedDate: apiStudent.joined_on || localStudent?.joinedDate || defaultValues.joinedDate,
      };
    });
  };

  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<
        Array<{ id: number; name: string; email: string; mobile: string; status: string; teacher_id: number; teacher_name: string; joined_on: string | null }>
      >("/admin/student/list", {
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
      });

      if (response.data && Array.isArray(response.data)) {
        const mergedStudents = mergeStudentsWithLocalStorage(response.data);
        setStudents(mergedStudents);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err?.error || err?.message || "Failed to fetch students");

      // Fallback to localStorage on error
      const loadedStudents = storage.getItem("students") || [];
      setStudents(loadedStudents as Student[]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  // Fetch students on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchStudents();
    }
  }, [fetchStudents]);

  // Note: API handles search and pagination, so filteredStudents = students (already paginated)
  const filteredStudents = useMemo(() => {
    // API returns paginated results, so we use students directly
    return students;
  }, [students]);

  // API already returns paginated data, so paginatedStudents = students
  const paginatedStudents = useMemo(() => {
    // API handles pagination, so we use the response directly
    return students;
  }, [students]);

  // For total pages, we'll use a default since API doesn't return total count
  // In a real implementation, API should return { data: [], total: number, page: number, limit: number }
  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));


  const bulkToolbarStatusActions: Array<{
    label: string;
    status: Student["status"];
    icon: ComponentType<ComponentProps<typeof CheckIcon>>;
    classes: string;
    modalIcon: ComponentType<ComponentProps<typeof CheckIcon>>;
    modalColors: string;
  }> = [
    {
      label: "Active",
      status: "active",
      icon: CheckIcon,
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
      modalIcon: CheckCircleIcon,
      modalColors: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Inactive",
      status: "inactive",
      icon: XMarkIcon,
      classes: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
      modalIcon: XCircleIcon,
      modalColors: "bg-rose-100 text-rose-600",
    },
  ];

  const getBulkStatusAction = (status: Student["status"]) =>
    bulkToolbarStatusActions.find((action) => action.status === status) ??
    null;

  const getBulkStatusLabel = (status: Student["status"]) =>
    getBulkStatusAction(status)?.label ?? status;

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map((s) => s.id));
    }
  };

  // Individual select toggle
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
    setCurrentPage((prev) => (prev > maxPage ? maxPage : prev));
  }, [filteredStudents, pageSize]);

  // Delete single student
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) {
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
      return;
    }

    try {
      const studentIdNum = parseInt(studentToDelete.id, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID');
      }

      // Call delete API
      const response = await apiClient.delete<{
        status: string;
        message: string;
      }>('/admin/student/delete', {
        data: {
          student_id: studentIdNum,
        },
      });

      // Check if deletion was successful
      if (response.data && response.data.message) {
        // Remove from local state
        const updatedStudents = students.filter(
          (s) => s.id !== studentToDelete.id
        );
        setStudents(updatedStudents);
        storage.setItem("students", updatedStudents);

        // Also remove from selected if present
        setSelectedIds((prev) => prev.filter((id) => id !== studentToDelete.id));
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (err: any) {
      console.error('Error deleting student:', err);
      setError(err?.error || err?.message || 'Failed to delete student');
      // Still remove from UI on error (optimistic update)
      const updatedStudents = students.filter(
        (s) => s.id !== studentToDelete.id
      );
      setStudents(updatedStudents);
      storage.setItem("students", updatedStudents);
      setSelectedIds((prev) => prev.filter((id) => id !== studentToDelete.id));
    } finally {
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  // Bulk delete
  const handleBulkDeleteClick = () => {
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setBulkDeleteOpen(false);
      return;
    }

    try {
      // Convert selected IDs to numbers
      const studentIds = selectedIds
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));

      if (studentIds.length === 0) {
        throw new Error('No valid student IDs selected');
      }

      // Call bulk delete API
      const response = await apiClient.post<{
        status: boolean;
        message: string;
      }>('/admin/student/bulk_delete', {
        student_ids: studentIds,
      });

      if (response.data && response.data.status) {
        // Remove from local state
        const updatedStudents = students.filter((s) => !selectedIds.includes(s.id));
        setStudents(updatedStudents);
        storage.setItem("students", updatedStudents);
        setSelectedIds([]);
      } else {
        throw new Error(response.data?.message || 'Bulk delete failed');
      }
    } catch (err: any) {
      console.error('Error deleting students:', err);
      setError(err?.error || err?.message || 'Failed to delete students');
      // Still remove from UI on error (optimistic update)
      const updatedStudents = students.filter((s) => !selectedIds.includes(s.id));
      setStudents(updatedStudents);
      storage.setItem("students", updatedStudents);
      setSelectedIds([]);
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const applyBulkStatusUpdate = async (status: Student["status"]) => {
    if (selectedIds.length === 0) return;

    try {
      // Convert selected IDs to numbers
      const studentIds = selectedIds
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));

      if (studentIds.length === 0) {
        throw new Error('No valid student IDs selected');
      }

      let apiEndpoint = '';
      
      // Map statuses to API endpoints
      if (status === 'active') {
        // Activate students
        apiEndpoint = '/admin/student/bulk_activate';
      } else if (status === 'inactive') {
        // Deactivate students
        apiEndpoint = '/admin/student/bulk_deactivate';
      } else {
        // Update localStorage only for now
        const updatedStudents = students.map((student) =>
          selectedIds.includes(student.id)
            ? {
                ...student,
                status,
              }
            : student
        );
        setStudents(updatedStudents);
        storage.setItem("students", updatedStudents);
        setSelectedIds([]);
        setBulkStatusConfirm(null);
        return;
      }

      // Call bulk activate/deactivate API
      const response = await apiClient.post<{
        status: boolean;
        message: string;
      }>(apiEndpoint, {
        student_ids: studentIds,
      });

      if (response.data && response.data.status) {
        // Update local state
        const updatedStudents = students.map((student) =>
          selectedIds.includes(student.id)
            ? {
                ...student,
                status,
              }
            : student
        );
        setStudents(updatedStudents);
        storage.setItem("students", updatedStudents);
        setSelectedIds([]);
      } else {
        throw new Error(response.data?.message || 'Bulk status update failed');
      }
    } catch (err: any) {
      console.error('Error updating student status:', err);
      setError(err?.error || err?.message || 'Failed to update student status');
    } finally {
      setBulkStatusConfirm(null);
    }
  };

  const handleBulkStatus = (status: Student["status"]) => {
    if (selectedIds.length === 0) return;

      setBulkStatusConfirm(status);
  };

  const pendingStatusAction = bulkStatusConfirm
    ? getBulkStatusAction(bulkStatusConfirm)
    : null;

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout title="Students">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 pb-3 pt-5">
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold text-neutral-900">
                  Student List
                </div>
              </div>
              <div className="flex w-full justify-center md:w-auto md:justify-end">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search"
                  className="w-full max-w-md"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-3">
              <div className="flex-1 text-center">
                {selectedIds.length > 0 && (
                  <div className="pointer-events-none z-20 flex justify-center px-4">
                    <div className="pointer-events-auto flex flex-col gap-3 rounded-3xl px-5 py-3 text-neutral-900  md:flex-row md:items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-neutral-900">
                          {selectedIds.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {bulkToolbarStatusActions.map(
                          ({ label, status, icon: Icon, classes }) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleBulkStatus(status)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${classes}`}
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </button>
                          )
                        )}
                        <button
                          type="button"
                          onClick={handleBulkDeleteClick}
                          className="inline-flex items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-3 py-1.5 text-sm font-semibold text-danger-700 transition-transform hover:scale-[1.02] hover:bg-danger-100 hover:text-danger-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="px-6 py-16">
                <EmptyState
                  title="No students found"
                  description={
                    searchQuery
                      ? "Try adjusting your search criteria"
                      : "Students will appear here once they sign up"
                  }
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          paginatedStudents.length > 0 &&
                          selectedIds.length === paginatedStudents.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-center">Initial Capital</TableHead>
                    <TableHead className="text-center">Current Capital</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className={
                        selectedIds.includes(student.id) ? "bg-primary-50" : ""
                      }
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(student.id)}
                          onChange={() => handleSelect(student.id)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {student.teacherName || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-center text-neutral-900">
                        {student.initialCapital ? `₹${student.initialCapital.toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center text-neutral-900">
                        {student.currentCapital ? `₹${student.currentCapital.toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={student.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/students/${student.id}`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100"
                            aria-label="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/students/${student.id}/stats`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                            aria-label="View statistics"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/students/${student.id}/logs`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                            aria-label="View activity logs"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(student)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-danger-200 bg-danger-50 text-danger-600 transition-colors hover:bg-danger-100"
                            aria-label="Delete student"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Student"
          message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
          danger
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          open={bulkDeleteOpen}
          onClose={() => setBulkDeleteOpen(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Multiple Students"
          message={`Are you sure you want to delete ${
            selectedIds.length
          } student${
            selectedIds.length !== 1 ? "s" : ""
          }? This action cannot be undone.`}
          danger
        />

        <ConfirmDialog
          open={bulkStatusConfirm !== null}
          onClose={() => setBulkStatusConfirm(null)}
          onConfirm={() =>
            bulkStatusConfirm && applyBulkStatusUpdate(bulkStatusConfirm)
          }
          title={
            bulkStatusConfirm
              ? `Update Status to ${getBulkStatusLabel(bulkStatusConfirm)}`
              : "Update Status"
          }
          message={
            bulkStatusConfirm
              ? `Are you sure you want to mark ${selectedIds.length} student${
                  selectedIds.length !== 1 ? "s" : ""
                } as ${getBulkStatusLabel(bulkStatusConfirm)}?`
              : "Confirm status change."
          }
          danger={
            bulkStatusConfirm === "inactive"
          }
          icon={
            pendingStatusAction ? (
              <pendingStatusAction.modalIcon className="h-6 w-6" />
            ) : undefined
          }
          iconWrapperClassName={pendingStatusAction?.modalColors}
        />
      </div>
    </DashboardLayout>
  );
}
