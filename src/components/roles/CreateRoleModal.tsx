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
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Open New Position</h3>
              <p className="text-xs text-slate-500">Configure role evaluation criteria & scoring weights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Position Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack Technical Lead"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mission & Role Scope
            </label>
            <textarea
              rows={3}
              placeholder="Describe core initiatives, team architecture, and scope of impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddRequirement()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                Suggested Core Requirements:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !requirements.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddRequirement(skill)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Requirement Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {requirements.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800"
                >
                  <Tag className="h-3 w-3 text-blue-600" />
                  {req}
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="rounded-full hover:bg-blue-200 p-0.5 text-blue-600 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
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
