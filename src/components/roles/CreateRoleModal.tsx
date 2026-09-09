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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[100svh] overflow-y-auto rounded-xl border border-border bg-card p-6 sm:p-7 shadow-xl animate-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-foreground tracking-tight">Open New Position</h3>
              <p className="text-xs text-muted-foreground font-sans">Configure role evaluation criteria & scoring weights</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-sans">
              Position Title
            </label>
            <Input
              type="text"
              placeholder="e.g. Senior Full Stack Technical Lead"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-sans">
              Mission & Role Scope
            </label>
            <Textarea
              rows={3}
              placeholder="Describe core initiatives, team architecture, and scope of impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-sans">
              Must-Have Competencies (For Automated Fit Scoring)
            </label>
            <div className="mt-1.5 flex gap-2">
              <Input
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
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleAddRequirement()}
                className="gap-1.5 font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add
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
                    className="h-7 px-2.5 text-[11px] font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    + {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Requirements Pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {requirements.map((req, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-primary/10 text-primary border border-primary/20 gap-1.5 py-1 px-2.5 text-xs font-semibold"
                >
                  <Tag className="h-3 w-3 text-primary" />
                  {req}
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="rounded-full hover:bg-primary/20 p-0.5 text-primary ml-1 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 font-semibold"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Position..." : "Open Position"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
