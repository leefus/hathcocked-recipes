import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import TabBar from "@/components/TabBar";
import PWA from "@/components/PWA";
import "./globals.css";

// Editorial & story: titles, origin notes, heirloom marginalia.
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  // Next 14 has no capsize metrics for Newsreader (stored as newsreader16pt),
  // which makes the automatic fallback override throw. Georgia is close enough.
  adjustFontFallback: false,
  fallback: ["Georgia", "serif"],
});

// Utility & precision: ingredients, steps, measurements, metadata.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata = {
  title: "Hathcocked Recipes",
  description: "The family recipe book.",
  manifest: "/manifest.webmanifest",
  applicationName: "Hathcocked",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Hathcocked",
    // Cream status bar rather than a black slab above the content.
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#FAF5EE",
  width: "device-width",
  initialScale: 1,
  // Installed apps shouldn't rubber-band like a web page.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen">
        {children}
        <TabBar />
        <PWA />
      </body>
    </html>
  );
}
