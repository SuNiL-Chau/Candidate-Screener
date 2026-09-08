"use client";

import React, { useState } from "react";
import { Plus, X, Loader2, Sparkles, Briefcase, Tag } from "lucide-react";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SUGGESTED_SKILLS = [
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "PostgreSQL",
  "System Architecture",
  "AWS",
  "Docker",
  "AI Security & Red Teaming",
];

export function CreateRoleModal({ isOpen, onClose, onCreated }: CreateRoleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentReq, setCurrentReq] = useState("");
  const [requirements, setRequirements] = useState<string[]>([
    "TypeScript",
    "React / Next.js",
    "Node.js",
    "PostgreSQL",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddRequirement = (skillToAdd?: string) => {
    const val = (skillToAdd || currentReq).trim();
    if (val && !requirements.includes(val)) {
      setRequirements([...requirements, val]);
      if (!skillToAdd) setCurrentReq("");
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a position title.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a short role description.");
      return;
    }
    if (requirements.length === 0) {
      setError("Please specify at least one must-have requirement.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requirements,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create position");
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create position");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-white p-6 sm:p-7 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-foreground tracking-tight">Open New Position</h3>
              <p className="text-xs text-muted-foreground">Configure role evaluation criteria & scoring weights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Position Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack Technical Lead"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Mission & Role Scope
            </label>
            <textarea
              rows={3}
              placeholder="Describe core initiatives, team architecture, and scope of impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Must-Have Competencies (For Automated Fit Scoring)
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                placeholder="Type requirement and press Enter..."
                value={currentReq}
                onChange={(e) => setCurrentReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddRequirement()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Suggested Core Requirements:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !requirements.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddRequirement(skill)}
                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Requirements Pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {requirements.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
                >
                  <Tag className="h-3 w-3 text-primary" />
                  {req}
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="rounded-full hover:bg-primary/20 p-0.5 text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Position..." : "Open Position"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
