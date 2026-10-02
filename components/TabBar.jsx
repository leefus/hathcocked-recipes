"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart } from "lucide-react";

const TABS = [
  { href: "/", label: "Cookbook", icon: BookOpen },
  { href: "/saved", label: "Favorites", icon: Heart },
];

export default function TabBar() {
  const path = usePathname();
  // The recipe page is full-bleed; a floating bar would sit on the photo.
  if (path?.startsWith("/recipes/")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-8">
      <div className="surface-2 flex items-center gap-1 rounded-full p-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`tap flex items-center gap-2 rounded-full px-5 text-label-lg font-semibold transition-colors ${
                active ? "bg-primary text-white" : "text-muted hover:bg-ghost-tint hover:text-ink"
              }`}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={2.2}
                fill={active && href === "/saved" ? "currentColor" : "none"}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
