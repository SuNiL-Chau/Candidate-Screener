import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted text-foreground flex">
      {/* Permanent Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen bg-muted">
        <main className="flex-1 p-6 lg:p-8 max-w-(--breakpoint-2xl) w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
