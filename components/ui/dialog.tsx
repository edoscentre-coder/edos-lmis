"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-lg overflow-hidden rounded-lg border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50 sm:w-full"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <h2 className="min-w-0 text-base font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
      <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto p-4 sm:p-5">{children}</div>
    </dialog>
  );
}
