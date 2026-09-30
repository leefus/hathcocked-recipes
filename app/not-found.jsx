import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-canvas px-6"><div className="max-w-xl rounded-xl border border-hairline bg-card p-10 text-center shadow-e2"><p className="text-label-md uppercase tracking-[0.2em] text-muted">404</p><h1 className="mt-4 font-serif text-display-mobile md:text-display-lg">This recipe is not in the archive.</h1><p className="mt-4 text-body-lg text-muted">The page you requested may have moved, or it may never have been recorded.</p><Link href="/recipes" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-body-sm font-medium text-white hover:bg-primary-deep">Return to recipes</Link></div></main>;
}
