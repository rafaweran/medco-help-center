"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "doctor" | "patient" | "both" | "draft" | "published" | "archived";
  className?: string;
}

const variants = {
  default: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  doctor: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  patient: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  both: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  draft: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  published: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  archived: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const labels: Record<string, string> = {
  doctor: "Médico",
  patient: "Paciente",
  both: "Ambos",
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {typeof children === "string" && labels[children] ? labels[children] : children}
    </span>
  );
}
