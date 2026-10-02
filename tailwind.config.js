/**
 * Heirloom Kitchen — design tokens from DESIGN.md.
 *
 * Note on a conflict in the source: DESIGN.md's YAML frontmatter and its prose
 * section specify different hex values for all eight core colors (frontmatter
 * primary #9f3c16 vs prose #C85A32, and so on). These are the PROSE values,
 * which are the ones carrying names and stated intent.
 *
 * The radius scale below is also DESIGN.md's, not Tailwind's default — `lg` is
 * 1rem here, not 0.5rem. Class names mean what the design doc says they mean.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Canvas & surface architecture
        canvas: "#FAF5EE",        // Cream Buttermilk — base background
        card: "#FFFDF9",          // Linen Card — container surface
        hairline: "#E8DFD1",      // Aged Parchment — muted borders
        "hairline-strong": "#DFD5C4",

        // Text
        ink: "#2B2118",           // Dark Espresso — replaces pure black
        muted: "#736356",         // Warm Driftwood — captions, subdued text
        struck: "#8C7C70",        // completed ingredient rows

        // Accents
        primary: "#C85A32",       // Terracotta Paprika — CTAs, active controls
        "primary-deep": "#6D2508",
        "primary-tint": "#FFF1E8",
        sage: "#5E7D63",          // Soft Sage — taxonomy, provenance
        "sage-ink": "#3D5942",
        saffron: "#C98836",       // Golden Saffron — heirloom annotations
        marginalia: "#F6EFE2",
        "ghost-tint": "#F1E9DC",
        "contributor-bg": "#F4EADB",
        "contributor-br": "#E2D5C3",
      },
      fontFamily: {
        // Newsreader: editorial voice — titles, lore, italic notes
        serif: ["var(--font-serif)", "Georgia", "serif"],
        // Plus Jakarta Sans: utility — ingredients, steps, measurements
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em" }],
        "display-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.015em" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em" }],
        "headline-md": ["22px", { lineHeight: "30px" }],
        "headline-sm": ["18px", { lineHeight: "24px" }],
        "body-lg": ["17px", { lineHeight: "26px" }],
        "body-md": ["15px", { lineHeight: "22px" }],
        "body-sm": ["13px", { lineHeight: "18px" }],
        "label-lg": ["14px", { lineHeight: "18px", letterSpacing: "0.01em" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.03em" }],
        "note-italic": ["16px", { lineHeight: "24px" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",     // cards, photo frames
        xl: "1.5rem",   // sheets, hero banners
        full: "9999px",
      },
      boxShadow: {
        // Warm umber ambient, never cold gray
        e1: "0 2px 8px rgba(43, 33, 24, 0.04)",
        e2: "0 8px 24px rgba(43, 33, 24, 0.08)",
        e3: "0 16px 40px rgba(43, 33, 24, 0.14)",
        focus: "0 0 0 3px rgba(200, 90, 50, 0.15)",
      },
      maxWidth: { container: "1200px" },
      keyframes: {
        qtyPulse: {
          "0%": { transform: "translateY(-2px)", opacity: "0.4" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: { qtyPulse: "qtyPulse 0.35s ease-out" },
    },
  },
  plugins: [],
};
