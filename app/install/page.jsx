import Brand from "@/components/Brand";

export const metadata = {
  title: "Put it on your phone — Hathcocked Recipes",
  description: "How to add the family recipe book to your home screen.",
};

/**
 * The page to text to family. Deliberately plain: no jargon, no "PWA", and it
 * admits the iOS steps may have moved rather than pretending precision.
 */

function Step({ n, children }) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage font-serif text-label-lg font-semibold text-white">
        {n}
      </span>
      <p className="pt-1 text-body-lg text-ink">{children}</p>
    </li>
  );
}

export default function Install() {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-36 pt-8 sm:px-8">
      <header className="flex items-center gap-4">
        <Brand size={64} />
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-sage-ink">
            One time only
          </p>
          <h1 className="mt-1 font-serif text-display-mobile font-medium text-ink">
            Put it on your phone
          </h1>
        </div>
      </header>

      <p className="mt-6 font-serif text-body-lg leading-relaxed text-ink">
        There&apos;s nothing to download and no account to make. This adds an icon
        to your home screen that opens straight to the recipes — and it keeps
        working in the kitchen even when the signal doesn&apos;t.
      </p>

      {/* iPhone ------------------------------------------------------------ */}
      <section className="mt-10">
        <h2 className="font-serif text-headline-md font-semibold text-ink">
          On an iPhone
        </h2>
        <p className="mt-2 text-body-md text-muted">
          You have to use Safari for this part. It won&apos;t work from Chrome.
        </p>
        <ol className="mt-5 space-y-5">
          <Step n={1}>Open this page in Safari.</Step>
          <Step n={2}>
            Tap the <strong>Share</strong> button — the square with an arrow
            pointing up.
          </Step>
          <Step n={3}>
            Scroll down the list and tap <strong>Add to Home Screen</strong>.
          </Step>
          <Step n={4}>
            Tap <strong>Add</strong> in the top corner. The icon will be on your
            home screen.
          </Step>
        </ol>
        <aside className="mt-6 rounded-md border-l-4 border-saffron bg-marginalia p-5">
          <p className="font-serif text-note-italic italic leading-relaxed text-ink">
            Apple moved these buttons around in the latest iPhone update, so
            yours might be tucked behind a three-dot menu first, and you may see
            a switch called &ldquo;Open as Web App&rdquo; — leave that one turned
            on. If you get stuck, just send me a screenshot.
          </p>
        </aside>
      </section>

      {/* Android ----------------------------------------------------------- */}
      <section className="mt-12">
        <h2 className="font-serif text-headline-md font-semibold text-ink">
          On an Android phone
        </h2>
        <p className="mt-2 text-body-md text-muted">
          Usually a banner appears on its own. If it does, tap Add and
          you&apos;re done.
        </p>
        <ol className="mt-5 space-y-5">
          <Step n={1}>Open this page in Chrome.</Step>
          <Step n={2}>
            Tap the <strong>three dots</strong> in the top corner.
          </Step>
          <Step n={3}>
            Tap <strong>Add to Home screen</strong>, then <strong>Install</strong>.
          </Step>
        </ol>
      </section>

      <section className="mt-12 rounded-lg border border-hairline bg-card p-6">
        <h2 className="font-serif text-headline-sm font-semibold text-ink">
          A few things worth knowing
        </h2>
        <ul className="mt-3 space-y-2 text-body-md text-muted">
          <li>
            Recipes you&apos;ve opened before will still open with no signal.
          </li>
          <li>
            Tap <strong>½×</strong> or <strong>2×</strong> on a recipe and every
            measurement changes with it.
          </li>
          <li>
            Search looks inside the ingredients too — type
            &ldquo;buttermilk&rdquo; to find everything that uses it.
          </li>
          <li>It updates by itself. You&apos;ll never have to reinstall.</li>
        </ul>
      </section>
    </div>
  );
}
