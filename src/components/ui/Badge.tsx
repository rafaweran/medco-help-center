"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "doctor" | "patient" | "both" | "draft" | "published" | "archived";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
  both: "bg-purple-100 text-purple-700",
  draft: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
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
