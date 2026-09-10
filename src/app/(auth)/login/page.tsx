"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("recruiter@crystalgroup.com");
  const [password, setPassword] = useState("hr@crystalGroup@26");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("recruiter@crystalgroup.com");
    setPassword("hr@crystalGroup@26");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
            Crystal<span className="text-primary">Screen</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground font-sans">
            Enterprise Candidate Screener with AI Integrity Layer
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 ring-0 shadow-xs bg-card p-6 sm:p-8">
          <CardHeader className="p-0 pb-6 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Recruiter Sign In
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Access protected candidate evaluation suite
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemoCredentials}
                className="cursor-pointer gap-1.5 text-xs font-medium hover:bg-muted border-border"
                title="Click to auto-fill demo credentials"
              >
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                Demo Auth
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-6">
            {error && (
              <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground tracking-wide font-sans mb-1.5">
                  Work Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@crystalgroup.com"
                  className="h-10 bg-background text-foreground border-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground tracking-wide font-sans mb-1.5">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 bg-background text-foreground border-input"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 font-medium cursor-pointer gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Feature highlights */}
            <div className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground space-y-2 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Pre-scoring adversarial prompt injection defense</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Employment timeline overlap & templated inflation checks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Decoupled requirement-based candidate fit scoring</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground/80 font-mono">
          Crystal Group Candidate Screener • Take-Home Assignment v4
        </p>
      </div>
    </div>
  );
}

