"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ComponentType,
  type ComponentProps,
  type ChangeEvent,
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
  PlayIcon,
  StopIcon,
  BoltIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  StopCircleIcon,
  PauseCircleIcon,
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
import { Teacher } from "@/types";
import { isAuthenticated } from "@/services/authService";
import apiClient from "@/lib/api";

const PAGE_SIZE_OPTIONS = [50, 100, 200, 300];

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState<
    Teacher["status"] | null
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
  const mergeTeachersWithLocalStorage = (
    apiTeachers: Array<{ id: number; name: string; email: string; status: string }>
  ): Teacher[] => {
    const localStorageTeachers = (storage.getItem("teachers") || []) as Teacher[];

    // Hardcoded default dummy values for optional fields
    const defaultValues = {
      mobile: "",
      phone: "0000000000",
      totalStudents: 0,
      totalTrades: 0,
      totalCapital: 0,
      profitLoss: 0,
      winRate: 0,
      specialization: "General Trading",
      joinedDate: new Date().toISOString(),
    };

    return apiTeachers.map((apiTeacher) => {
      // Find matching teacher in localStorage by id
      const localTeacher = localStorageTeachers.find(
        (t) => t.id === String(apiTeacher.id)
      );

      // Merge: API data > localStorage data > default dummy values
      return {
        id: String(apiTeacher.id), // Convert number to string
        name: apiTeacher.name,
        email: apiTeacher.email,
        status: apiTeacher.status as Teacher["status"],
        mobile: localTeacher?.mobile || defaultValues.mobile,
        phone: localTeacher?.phone || defaultValues.phone,
        totalStudents: localTeacher?.totalStudents ?? defaultValues.totalStudents,
        totalTrades: localTeacher?.totalTrades ?? defaultValues.totalTrades,
        totalCapital: localTeacher?.totalCapital ?? defaultValues.totalCapital,
        profitLoss: localTeacher?.profitLoss ?? defaultValues.profitLoss,
        winRate: localTeacher?.winRate ?? defaultValues.winRate,
        specialization: localTeacher?.specialization || defaultValues.specialization,
        joinedDate: localTeacher?.joinedDate || defaultValues.joinedDate,
      };
    });
  };

  // Fetch teachers from API
  const fetchTeachers = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<
        Array<{ id: number; name: string; email: string; status: string }>
      >("/admin/teacher/list", {
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
      });

      if (response.data && Array.isArray(response.data)) {
        const mergedTeachers = mergeTeachersWithLocalStorage(response.data);
        setTeachers(mergedTeachers);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      setError(err?.error || err?.message || "Failed to fetch teachers");

      // Fallback to localStorage on error
      const loadedTeachers = storage.getItem("teachers") || [];
      setTeachers(loadedTeachers as Teacher[]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  // Fetch teachers on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchTeachers();
    }
  }, [fetchTeachers]);

  // Note: API handles search and pagination, so filteredTeachers = teachers (already paginated)
  const filteredTeachers = useMemo(() => {
    // API returns paginated results, so we use teachers directly
    return teachers;
  }, [teachers]);

  // API already returns paginated data, so paginatedTeachers = teachers
  const paginatedTeachers = useMemo(() => {
    // API handles pagination, so we use the response directly
    return teachers;
  }, [teachers]);

  // For total pages, we'll use a default since API doesn't return total count
  // In a real implementation, API should return { data: [], total: number, page: number, limit: number }
  const totalPages = Math.max(1, Math.ceil(teachers.length / pageSize));


  const bulkToolbarStatusActions: Array<{
    label: string;
    status: Teacher["status"];
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
    {
      label: "Open",
      status: "open",
      icon: PlayIcon,
      classes:
        "border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100",
      modalIcon: PlayCircleIcon,
      modalColors: "bg-teal-100 text-teal-600",
    },
    {
      label: "Close",
      status: "close",
      icon: StopIcon,
      classes:
        "border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100",
      modalIcon: StopCircleIcon,
      modalColors: "bg-purple-100 text-purple-600",
    },
    {
      label: "Live",
      status: "live",
      icon: BoltIcon,
      classes:
        "border-lime-200 bg-lime-50 text-lime-600 hover:bg-lime-100",
      modalIcon: BoltIcon,
      modalColors: "bg-lime-100 text-lime-600",
    },
    {
      label: "Test",
      status: "test",
      icon: PauseIcon,
      classes:
        "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100",
      modalIcon: PauseCircleIcon,
      modalColors: "bg-amber-100 text-amber-600",
    },
  ];

  const getBulkStatusAction = (status: Teacher["status"]) =>
    bulkToolbarStatusActions.find((action) => action.status === status) ??
    null;

  const getBulkStatusLabel = (status: Teacher["status"]) =>
    getBulkStatusAction(status)?.label ?? status;

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTeachers.map((t) => t.id));
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
    const maxPage = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
    setCurrentPage((prev) => (prev > maxPage ? maxPage : prev));
  }, [filteredTeachers, pageSize]);

  // Delete single teacher
  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      const updatedTeachers = teachers.filter(
        (t) => t.id !== teacherToDelete.id
      );
      setTeachers(updatedTeachers);
      storage.setItem("teachers", updatedTeachers);

      // Also remove from selected if present
      setSelectedIds((prev) => prev.filter((id) => id !== teacherToDelete.id));
    }
    setDeleteConfirmOpen(false);
    setTeacherToDelete(null);
  };

  // Bulk delete
  const handleBulkDeleteClick = () => {
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    const updatedTeachers = teachers.filter((t) => !selectedIds.includes(t.id));
    setTeachers(updatedTeachers);
    storage.setItem("teachers", updatedTeachers);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const applyBulkStatusUpdate = (status: Teacher["status"]) => {
    if (selectedIds.length === 0) return;

    const updatedTeachers = teachers.map((teacher) =>
      selectedIds.includes(teacher.id)
        ? {
            ...teacher,
            status,
          }
        : teacher
    );

    setTeachers(updatedTeachers);
    storage.setItem("teachers", updatedTeachers);
    setSelectedIds([]);
    setBulkStatusConfirm(null);
  };

  const handleBulkStatus = (status: Teacher["status"]) => {
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
    <DashboardLayout title="Teachers">
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
                  Teacher List
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
            <div className="flex flex-warp item-center gap-3 md:gap-6 mt-3">
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
            {filteredTeachers.length === 0 ? (
              <div className="px-6 py-16">
                <EmptyState
                  title="No teachers found"
                  description={
                    searchQuery
                      ? "Try adjusting your search criteria"
                      : "Teachers will appear here once they sign up"
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
                          paginatedTeachers.length > 0 &&
                          selectedIds.length === paginatedTeachers.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Trades</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTeachers.map((teacher) => (
                    <TableRow
                      key={teacher.id}
                      className={
                        selectedIds.includes(teacher.id) ? "bg-primary-50" : ""
                      }
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(teacher.id)}
                          onChange={() => handleSelect(teacher.id)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900">
                        {teacher.name}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="text-center text-neutral-900">
                        {teacher.totalStudents}
                      </TableCell>
                      <TableCell className="text-center text-neutral-900">
                        {teacher.totalTrades}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={teacher.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/teachers/${teacher.id}`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100"
                            aria-label="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/teachers/${teacher.id}/stats`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                            aria-label="View statistics"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/teachers/${teacher.id}/logs`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                            aria-label="View activity logs"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(teacher)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-danger-200 bg-danger-50 text-danger-600 transition-colors hover:bg-danger-100"
                            aria-label="Delete teacher"
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
            totalItems={filteredTeachers.length}
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
          title="Delete Teacher"
          message={`Are you sure you want to delete ${teacherToDelete?.name}? This action cannot be undone.`}
          danger
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          open={bulkDeleteOpen}
          onClose={() => setBulkDeleteOpen(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Multiple Teachers"
          message={`Are you sure you want to delete ${
            selectedIds.length
          } teacher${
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
              ? `Are you sure you want to mark ${selectedIds.length} teacher${
                  selectedIds.length !== 1 ? "s" : ""
                } as ${getBulkStatusLabel(bulkStatusConfirm)}?`
              : "Confirm status change."
          }
          danger={
            bulkStatusConfirm === "inactive" || bulkStatusConfirm === "close"
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
