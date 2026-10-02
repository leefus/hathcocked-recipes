import Link from "next/link";
import Brand from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 pb-36 pt-24 text-center">
      <div className="flex justify-center"><Brand size={80} /></div>
      <h1 className="mt-6 font-serif text-headline-lg font-semibold text-ink">
        No recipe here
      </h1>
      <p className="mt-3 text-body-md text-muted">
        That link doesn&apos;t match anything in the book.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-12 items-center rounded-full bg-primary px-7 text-label-lg font-semibold text-white transition-transform active:scale-[0.98]"
      >
        Back to the cookbook
      </Link>
    </div>
  );
}
