"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

const LINKS = [
  { label: "HOME", href: "/" },
  { label: "DATABASES", href: "/databases" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="py-3">
      <nav className="grid grid-cols-3 items-center rounded-md bg-card sm:flex sm:justify-between sm:pr-4">
        <div className="col-span-2 flex items-center justify-around sm:col-auto sm:justify-start">
          {LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 sm:flex-none relative px-4 py-4 text-center text-[10px] font-bold tracking-[0.2em] transition-colors sm:px-8 sm:text-xs ${isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-foreground sm:left-6 sm:right-6" />
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href="/settings"
          className={`flex py-4 items-center justify-center transition-colors sm:h-10 sm:w-10 sm:rounded-full sm:py-0 ${pathname === "/settings"
            ? "text-foreground sm:bg-secondary"
            : "text-muted-foreground hover:text-foreground sm:hover:bg-secondary/50"
            }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] font-bold tracking-[0.2em] sm:hidden">SETTINGS</span>
          </div>
          {pathname === "/settings" && (
            <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-foreground sm:hidden" />
          )}
        </Link>
      </nav>
    </header>
  );
}
