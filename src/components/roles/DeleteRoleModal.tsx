"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteRoleModalProps {
  isOpen: boolean;
  role: {
    id: string;
    title: string;
    candidateCount?: number;
  } | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteRoleModal({
  isOpen,
  role,
  onClose,
  onDeleted,
}: DeleteRoleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !role) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete position.");
      }

      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete position.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[100svh] overflow-y-auto rounded-2xl border-0 ring-0 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold font-heading text-foreground tracking-tight">
            Delete Position?
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-foreground font-semibold">"{role.title}"</strong>?
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 flex items-start gap-2.5 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="font-sans leading-relaxed">
            This will permanently remove this position and all{" "}
            <strong className="font-bold">{role.candidateCount ?? 0} candidate profiles</strong>,
            pre-score integrity audits, and evaluation rankings. This action cannot be reversed.
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="text-muted-foreground cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 font-semibold shadow-xs cursor-pointer"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isDeleting ? "Deleting Position..." : "Delete Permanently"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
