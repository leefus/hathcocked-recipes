"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/contributors", label: "Contributors" },
  { href: "/about", label: "Our Story" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button type="button" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-card text-ink shadow-e1">
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {isOpen && (
        <div className="absolute left-4 right-4 top-[76px] z-50 rounded-xl border border-hairline bg-card p-4 shadow-e3">
          <nav className="flex flex-col gap-2">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2 text-body-md text-muted hover:bg-ghost-tint hover:text-ink">{link.label}</Link>)}
          </nav>
        </div>
      )}
    </div>
  );
}
