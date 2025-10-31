"use client";

import {
  useState,
  useEffect,
  useMemo,
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
  PlayIcon,
  StopIcon,
  BoltIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
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

const ITEMS_PER_PAGE = 10;

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState<
    Teacher["status"] | null
  >(null);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Load teachers from localStorage
  useEffect(() => {
    const loadedTeachers = storage.getItem("teachers") || [];
    setTeachers(loadedTeachers);
  }, []);

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;

    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  // Paginate teachers
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTeachers, currentPage]);

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const pageStart =
    filteredTeachers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd =
    filteredTeachers.length === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, filteredTeachers.length);

  const bulkToolbarStatusActions: Array<{
    label: string;
    status: Teacher["status"];
    icon: ComponentType<ComponentProps<typeof CheckIcon>>;
    classes: string;
  }> = [
    {
      label: "Active",
      status: "active",
      icon: CheckIcon,
      classes: "bg-green-500/15 text-green-200 hover:bg-green-500/25",
    },
    {
      label: "Inactive",
      status: "inactive",
      icon: XMarkIcon,
      classes: "bg-red-500/15 text-red-200 hover:bg-red-500/25",
    },
    {
      label: "Open",
      status: "open",
      icon: PlayIcon,
      classes: "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25",
    },
    {
      label: "Close",
      status: "close",
      icon: StopIcon,
      classes: "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
    },
    {
      label: "Live",
      status: "live",
      icon: BoltIcon,
      classes: "bg-lime-500/15 text-lime-200 hover:bg-lime-500/25",
    },
    {
      label: "Test",
      status: "test",
      icon: PauseIcon,
      classes: "bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
    },
  ];

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

    if (status === "close") {
      setBulkStatusConfirm(status);
      return;
    }

    applyBulkStatusUpdate(status);
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout title="Teachers">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 py-3">
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
                <h3 className="text-base font-semibold text-neutral-900">
                  Teacher Directory
                </h3>
                <p className="text-xs text-neutral-500">
                  {filteredTeachers.length} teacher
                  {filteredTeachers.length !== 1 ? "s" : ""} total
                </p>
              </div>
              <div className="flex w-full justify-center md:w-auto md:justify-end">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search teachers by name or email..."
                  className="w-full max-w-md"
                />
              </div>
            </div>
            <div className="flex flex-warp item-center gap-3 md:gap-6 mt-3">
              <div className="flex-1 text-center">
                {selectedIds.length > 0 && (
                  <div className="pointer-events-none z-20 flex justify-center px-4">
                    <div className="pointer-events-auto flex flex-col gap-3 rounded-full bg-neutral-900/95 px-5 py-3 text-white shadow-2xl shadow-neutral-900/20 backdrop-blur md:flex-row md:items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {selectedIds.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="text-xs font-medium text-neutral-300 transition-colors hover:text-white"
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
                              className={`inline-flex items-center gap-1.5 rounded-full border border-white/5 px-3 py-1.5 text-sm font-medium transition-colors ${classes}`}
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </button>
                          )
                        )}
                        <button
                          type="button"
                          onClick={handleBulkDeleteClick}
                          className="inline-flex items-center gap-1.5 rounded-full border border-danger-500/40 bg-danger-500 px-3 py-1.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-danger-500/90"
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

          <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <span className="text-xs text-neutral-500">
              {filteredTeachers.length === 0
                ? "No entries to display"
                : `Showing ${pageStart} to ${pageEnd} of ${filteredTeachers.length} entries`}
            </span>
            {filteredTeachers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(totalPages, 1)}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
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
          open={bulkStatusConfirm === "close"}
          onClose={() => setBulkStatusConfirm(null)}
          onConfirm={() => applyBulkStatusUpdate("close")}
          title="Mark Teachers as Closed"
          message={`Are you sure you want to mark ${
            selectedIds.length
          } teacher${selectedIds.length !== 1 ? "s" : ""} as closed?`}
          danger
        />
      </div>
    </DashboardLayout>
  );
}
