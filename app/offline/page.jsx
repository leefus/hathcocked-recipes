import Brand from "@/components/Brand";

export const metadata = { title: "Offline — Hathcocked Recipes" };

export default function Offline() {
  return (
    <div className="mx-auto max-w-md px-5 pb-36 pt-24 text-center">
      <div className="flex justify-center"><Brand size={80} /></div>
      <h1 className="mt-6 font-serif text-headline-lg font-semibold text-ink">
        No signal
      </h1>
      <p className="mt-3 text-body-md text-muted">
        Recipes you&apos;ve already opened still work. This one hasn&apos;t been
        saved to your phone yet.
      </p>
    </div>
  );
}
