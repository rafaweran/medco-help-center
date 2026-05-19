"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SearchBar } from "./SearchBar";

export function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 260);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo />
          <span className="text-gray-200 hidden sm:block">|</span>
          <span className="text-sm text-gray-400 hidden sm:block">Central de Ajuda</span>
        </div>

        {/* Mini search — fades in after scroll */}
        <div
          className={`flex-1 max-w-sm mx-auto transition-all duration-300 ${
            scrolled
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <SearchBar size="sm" />
        </div>

        <Link
          href="/admin"
          className="ml-auto text-xs text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
