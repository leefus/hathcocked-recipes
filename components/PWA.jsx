"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/**
 * Registers the service worker, and on Android offers a one-tap install.
 *
 * iOS has no equivalent: Safari never fires beforeinstallprompt, so the only
 * route there is the share sheet by hand. /install walks through it.
 */
export default function PWA() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .catch((e) => console.warn("service worker registration failed", e));
  }, []);

  useEffect(() => {
    // Already installed? Nothing to offer.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    try {
      if (sessionStorage.getItem("hk-install-dismissed") === "1") return;
    } catch {
      // private mode — just carry on
    }

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setDismissed(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const close = () => {
    setDismissed(true);
    try { sessionStorage.setItem("hk-install-dismissed", "1"); } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    close();
  };

  if (dismissed || !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center px-5">
      <div className="surface-2 flex w-full max-w-sm items-center gap-3 rounded-lg p-3 pl-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-headline-sm font-semibold text-ink">
            Add to your home screen
          </p>
          <p className="mt-0.5 text-body-sm text-muted">
            Opens like an app, works without signal.
          </p>
        </div>
        <button
          onClick={install}
          className="tap inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-label-lg font-semibold text-white transition-transform active:scale-[0.98]"
        >
          <Download className="h-4 w-4" strokeWidth={2.2} />
          Add
        </button>
        <button
          onClick={close}
          aria-label="Not now"
          className="tap grid shrink-0 place-items-center rounded-full text-muted hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
