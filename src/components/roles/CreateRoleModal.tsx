"use client";

import React, { useState } from "react";
import { Plus, X, Loader2, Sparkles, Briefcase, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
    const raw = skillToAdd !== undefined ? skillToAdd : currentReq;
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length > 0) {
      setRequirements((prev) => {
        const next = [...prev];
        for (const item of items) {
          if (!next.includes(item)) {
            next.push(item);
          }
        }
        return next;
      });
      if (skillToAdd === undefined) setCurrentReq("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3.5 sm:px-7 sm:py-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold font-heading text-foreground tracking-tight truncate">
                Open New Position
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-sans truncate">
                Configure role evaluation criteria & scoring weights
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Form with Scrollable Body & Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden font-sans">
          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-5 space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-sans mb-1">
                Position Title
              </label>
              <Input
                type="text"
                placeholder="e.g. Senior Full Stack Technical Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-sans mb-1">
                Mission & Role Scope
              </label>
              <Textarea
                rows={3}
                placeholder="Describe core initiatives, team architecture, and scope of impact..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 mb-1.5">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-sans">
                  Must-Have Competencies
                </label>
                <span className="text-[11px] text-muted-foreground font-sans">
                  Add multiple via comma (e.g. AWS, Docker)
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. Docker, AWS, GraphQL..."
                  value={currentReq}
                  onChange={(e) => setCurrentReq(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                  onBlur={() => {
                    if (currentReq.trim()) {
                      handleAddRequirement();
                    }
                  }}
                  className="flex-1 min-w-0"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAddRequirement()}
                  className="gap-1.5 font-semibold cursor-pointer shrink-0 px-3 sm:px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="mt-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 font-sans">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Suggested Core Requirements:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter((s) => !requirements.includes(s)).map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRequirement(skill)}
                      className="h-7 px-2 text-[11px] font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary cursor-pointer"
                    >
                      + {skill}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Requirements Pills */}
              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {requirements.map((req, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 gap-1.5 py-1 px-2.5 text-xs font-semibold max-w-full break-all"
                  >
                    <Tag className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="rounded-full hover:bg-primary/20 p-0.5 text-primary ml-1 cursor-pointer shrink-0"
                      aria-label={`Remove ${req}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 border-t border-border bg-card px-4 py-3 sm:px-7 sm:py-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-muted-foreground cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 font-semibold cursor-pointer w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? "Creating Position..." : "Open Position"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
