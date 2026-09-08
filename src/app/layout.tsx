import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, DM_Sans, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const ralewayHeading = Raleway({subsets:['latin'],variable:'--font-heading'});

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CrystalScreen — Candidate Screener with AI Integrity Layer",
  description:
    "Enterprise recruitment tool evaluating resume integrity (prompt injection, timeline overlaps, templated inflation) before candidate fit scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", jetbrainsMono.variable, "font-sans", dmSans.variable, ralewayHeading.variable)}
    >
      <body className="min-h-full font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
