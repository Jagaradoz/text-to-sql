"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "HOME", href: "/" },
  { label: "DATABASES", href: "/databases" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="py-3">
      <nav className="flex items-center gap-0 rounded-md bg-card">
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
      </nav>
    </header>
  );
}
