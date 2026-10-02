"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Recipe photo, or a warm placeholder when there isn't one — which is still
 * most of the book. Placeholders lean on the Heirloom Kitchen accents rather
 * than looking like a broken image.
 */
const WASHES = [
  ["#E8C9A8", "#C85A32"],
  ["#EBD6B4", "#C98836"],
  ["#D9DFCE", "#5E7D63"],
  ["#F0DCC6", "#A2461F"],
  ["#E2D3BC", "#8A6A3B"],
  ["#DCE2D4", "#4B6A51"],
];

export default function Dish({ recipe, sizes = "100vw", priority = false }) {
  const [failed, setFailed] = useState(false);

  if (recipe.photoUrl && !failed) {
    return (
      <>
        <Image
          src={recipe.photoUrl}
          alt={recipe.title}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
        />
        {/* subtle inward vignette, per the photo-forward card spec */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 -40px 60px -30px rgba(43,33,24,0.45)" }}
        />
      </>
    );
  }

  const [from, to] = WASHES[recipe.title.length % WASHES.length];
  return (
    <div
      role="img"
      aria-label={`${recipe.title} — no photo yet`}
      className="absolute inset-0 overflow-hidden"
      style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
    >
      {/* Faint ruled lines: the back of an index card. */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true"
      >
        {[30, 55, 80, 105, 130, 155, 180].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#FFFDF9" strokeWidth="1" />
        ))}
        <line x1="22" y1="0" x2="22" y2="200" stroke="#FFFDF9" strokeWidth="1.5" opacity="0.7" />
      </svg>
    </div>
  );
}
