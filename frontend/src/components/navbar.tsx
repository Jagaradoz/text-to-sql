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
      <nav className="flex items-center justify-between rounded-md bg-card pr-4">
        <div className="flex items-center gap-0">
          {LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-8 py-4 text-xs font-semibold tracking-[0.18em] transition-colors ${isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-foreground" />
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href="/settings"
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${pathname === "/settings"
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
        >
          <Settings className="h-5 w-5" />
        </Link>
      </nav>
    </header>
  );
}
