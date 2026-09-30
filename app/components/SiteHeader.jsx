import Link from "next/link";
import MobileNav from "@/app/components/MobileNav";

export default function SiteHeader({ title }) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <p className="text-label-md uppercase tracking-[0.22em] text-muted">Heirloom Kitchen</p>
          </div>
          <h1 className="font-serif text-headline-md md:text-headline-lg">{title}</h1>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-body-sm text-muted hover:text-ink">Home</Link>
          <Link href="/recipes" className="text-body-sm text-muted hover:text-ink">Recipes</Link>
          <Link href="/contributors" className="text-body-sm text-muted hover:text-ink">Contributors</Link>
          <Link href="/about" className="text-body-sm text-muted hover:text-ink">Our Story</Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
