"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  audience?: string;
  placeholder?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function SearchBar({
  defaultValue = "",
  audience,
  placeholder = "Buscar artigos, dúvidas, tutoriais...",
  size = "lg",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      const params = new URLSearchParams({ q: query.trim() });
      if (audience) params.set("audience", audience);
      router.push(`/busca?${params.toString()}`);
    },
    [query, audience, router]
  );

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative flex items-center">
        <Search
          className={cn(
            "absolute left-4 text-gray-400 pointer-events-none",
            size === "lg" ? "w-5 h-5" : "w-4 h-4"
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white pl-12 pr-32 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            size === "lg" ? "h-14 text-base" : "h-10 text-sm pr-24"
          )}
        />
        <button
          type="submit"
          className={cn(
            "absolute right-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            size === "lg" ? "px-5 py-2.5 text-sm" : "px-4 py-1.5 text-xs"
          )}
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
