"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "HOME", href: "/" },
  { label: "DATABASES", href: "/databases" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="w-full py-6">
      <div className="centered-layout">
        <nav className="flex items-center gap-0 rounded-md border border-border bg-card">
          {LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-8 py-4 text-xs font-semibold tracking-[0.18em] transition-colors ${
                  isActive
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
        </nav>
      </div>
    </header>
  );
}
