"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Check } from "lucide-react";
import { formatQty } from "@/lib/parse";

/**
 * Multiplier, not a servings stepper: only 13 of 80 recipes record servings,
 * so a target-guests calculation would be dead on most of the book. When
 * Servings IS known we show the resulting count as a bonus.
 */

const STEPS = [
  { v: 0.5, label: "½×" },
  { v: 1, label: "1×" },
  { v: 2, label: "2×" },
  { v: 3, label: "3×" },
];

function Quantity({ qty, scale, dimmed }) {
  const value = qty == null ? null : qty * scale;
  const scaled = qty != null && Math.abs(scale - 1) > 0.001;

  const [pulse, setPulse] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (value == null) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 420);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span
      className={`tnum w-16 shrink-0 text-right text-body-md font-semibold transition-colors ${
        pulse ? "qty-pulse" : ""
      } ${dimmed ? "text-struck" : scaled ? "text-primary" : "text-ink"}`}
    >
      {value == null ? "" : formatQty(value)}
    </span>
  );
}

export default function ScaledIngredients({ ingredients, servings }) {
  const [scale, setScale] = useState(1);
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const items = useMemo(() => ingredients.filter((x) => x.kind === "item"), [ingredients]);
  const unscalable = items.filter((x) => x.qty == null).length;
  const scaledServings = servings != null ? servings * scale : null;

  return (
    <div>
      {/* Gathering size ---------------------------------------------------- */}
      <div className="surface-1 flex flex-wrap items-center justify-between gap-3 rounded-lg p-3 pl-4">
        <div className="min-w-0">
          <p className="text-label-sm font-semibold uppercase tracking-[0.1em] text-sage-ink">
            Gathering size
          </p>
          <p className="mt-0.5 font-serif text-headline-sm font-semibold text-ink">
            {scaledServings != null ? (
              <>Serves <span className="tnum">{formatQty(scaledServings)}</span></>
            ) : (
              <><span className="tnum">{items.length}</span> ingredients</>
            )}
          </p>
        </div>

        <div
          role="group"
          aria-label="Scale the recipe"
          className="flex shrink-0 items-center gap-1 rounded-full bg-ghost-tint p-1"
        >
          {STEPS.map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setScale(v)}
              aria-pressed={scale === v}
              className={`h-11 min-w-[52px] rounded-full px-3 text-label-lg font-semibold transition-all active:scale-[0.98] ${
                scale === v ? "bg-primary text-white shadow-e1" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients ------------------------------------------------------- */}
      <ul className="mt-3">
        {ingredients.map((ing, i) => {
          if (ing.kind === "heading") {
            return (
              <li
                key={i}
                className="px-1 pb-1 pt-6 font-serif text-headline-sm font-semibold text-ink"
              >
                {ing.label}
              </li>
            );
          }

          const isChecked = checked.has(i);
          return (
            <li key={i} className="border-t border-hairline first:border-t-0">
              <button
                onClick={() => toggle(i)}
                aria-pressed={isChecked}
                className="tap flex w-full items-start gap-3 rounded py-3 pl-1 pr-2 text-left transition-colors hover:bg-ghost-tint/60"
              >
                <span
                  className={`mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded transition-colors ${
                    isChecked
                      ? "bg-primary"
                      : "border-[1.5px] border-hairline-strong bg-card"
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </span>

                <Quantity qty={ing.qty} scale={scale} dimmed={isChecked} />

                <span
                  className={`text-body-md transition-colors ${
                    isChecked ? "text-struck line-through" : "text-ink"
                  }`}
                >
                  {ing.rest}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Honest about what didn't scale, rather than letting you assume. */}
      {scale !== 1 && unscalable > 0 && (
        <p className="mt-4 rounded border-l-[3px] border-saffron bg-marginalia py-2.5 pl-3 pr-3 font-serif text-note-italic italic text-ink">
          {unscalable === 1 ? "One ingredient has" : `${unscalable} ingredients have`}{" "}
          no measurement, so {unscalable === 1 ? "it wasn't" : "they weren't"} scaled.
          Adjust by eye.
        </p>
      )}
    </div>
  );
}
