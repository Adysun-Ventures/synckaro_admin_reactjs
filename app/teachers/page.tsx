'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, ChartBarIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/Modal';
import { BulkActionBar } from '@/components/common/BulkActionBar';
import { EmptyState } from '@/components/common/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/common/Table';
import { storage } from '@/lib/storage';
import { Teacher } from '@/types';
import { isAuthenticated } from '@/services/authService';

const ITEMS_PER_PAGE = 10;

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load teachers from localStorage
  useEffect(() => {
    const loadedTeachers = storage.getItem('teachers') || [];
    setTeachers(loadedTeachers);
  }, []);

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    
    const query = searchQuery.toLowerCase();
    return teachers.filter(teacher => 
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

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTeachers.map(t => t.id));
    }
  };

  // Individual select toggle
  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Delete single teacher
  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      const updatedTeachers = teachers.filter(t => t.id !== teacherToDelete.id);
      setTeachers(updatedTeachers);
      storage.setItem('teachers', updatedTeachers);
      
      // Also remove from selected if present
      setSelectedIds(prev => prev.filter(id => id !== teacherToDelete.id));
    }
    setDeleteConfirmOpen(false);
    setTeacherToDelete(null);
  };

  // Bulk delete
  const handleBulkDeleteClick = () => {
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    const updatedTeachers = teachers.filter(t => !selectedIds.includes(t.id));
    setTeachers(updatedTeachers);
    storage.setItem('teachers', updatedTeachers);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout title="Teachers">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search teachers by name or email..."
          />
          <div className="text-sm text-neutral-500">
            {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Table */}
        {filteredTeachers.length === 0 ? (
          <EmptyState
            title="No teachers found"
            description={searchQuery ? 'Try adjusting your search criteria' : 'Teachers will appear here once they sign up'}
          />
        ) : (
          <>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={paginatedTeachers.length > 0 && selectedIds.length === paginatedTeachers.length}
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
                      className={selectedIds.includes(teacher.id) ? 'bg-primary-50' : ''}
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
                            onClick={() => router.push(`/teachers/${teacher.id}`)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100"
                            aria-label="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/teachers/${teacher.id}/stats`)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                            aria-label="View statistics"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/teachers/${teacher.id}/logs`)}
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={handleClearSelection}
            actions={[
              {
                label: 'Delete Selected',
                onClick: handleBulkDeleteClick,
                variant: 'danger',
              },
            ]}
          />
        )}

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
          message={`Are you sure you want to delete ${selectedIds.length} teacher${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
          danger
        />
      </div>
    </DashboardLayout>
  );
}

