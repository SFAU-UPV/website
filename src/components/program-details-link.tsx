"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProgramDetailContent } from "@/src/components/program-detail";
import { formatProgramTitle } from "@/src/lib/format";
import type { Program } from "@/src/types/domain";

export function ProgramDetailsLink({
  program,
  className,
  children,
}: {
  program: Program;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        onClick={() => {
          const dialog = dialogRef.current;
          if (dialog && !dialog.open) dialog.showModal();
          setOpen(true);
        }}
        aria-haspopup="dialog"
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        className="program-dialog"
        aria-labelledby={`program-dialog-title-${program.id}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
      >
        <div className="program-dialog-header">
          <h2 id={`program-dialog-title-${program.id}`}>{formatProgramTitle(program.name)}</h2>
          <button
            type="button"
            className="program-dialog-close"
            onClick={() => dialogRef.current?.close()}
            autoFocus
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">Close program details</span>
          </button>
        </div>
        {open && (
          <div className="program-dialog-content">
            <ProgramDetailContent program={program} />
          </div>
        )}
      </dialog>
    </>
  );
}
