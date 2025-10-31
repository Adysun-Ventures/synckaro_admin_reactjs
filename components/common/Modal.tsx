'use client';

import React, { useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  children?: ReactNode;
  icon?: ReactNode;
  iconWrapperClassName?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  children,
  icon,
  iconWrapperClassName,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const messageSegments = message.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) ?? [];
  const hasSentencePunctuation = /[.!?]/.test(message);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-xs bg-opacity-90 bg-black/80" aria-hidden="true" onClick={onClose} />

      {/* Modal Panel */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all animate-in zoom-in-95 ease-out duration-200">
        <div className="flex items-start">
          {(danger || icon) && (
            <div
              className={cn(
                'mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10',
                iconWrapperClassName ?? (danger ? 'bg-danger-100 text-danger-600' : 'bg-neutral-100 text-neutral-600')
              )}
            >
              {icon ?? (
                <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
          )}
          <div className={cn('flex-1', danger || icon ? 'ml-4' : '')}>
            <h3 className="text-lg font-semibold leading-6 text-neutral-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-neutral-500">
                {hasSentencePunctuation
                  ? messageSegments.map((segment, index) => (
                      <React.Fragment key={index}>
                        {segment.trim()}
                        {index < messageSegments.length - 1 && <br />}
                      </React.Fragment>
                    ))
                  : message}
              </p>
              {children}
            </div>
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-between">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

