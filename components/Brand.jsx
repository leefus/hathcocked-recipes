import Image from "next/image";

/** `size` is the image's intrinsic resolution; pass `className` to size it responsively. */
export default function Brand({ size = 52, className = "" }) {
  return (
    <Image
      src="/hathcocked-logo.png"
      alt="Hathcocked Recipes"
      width={size}
      height={size}
      priority
      className={`object-contain ${className}`}
    />
  );
}

/** The page-header logo, top right of the cookbook, favorites and add pages. */
export function HeaderBrand() {
  return <Brand size={112} className="h-20 w-20 shrink-0 sm:h-28 sm:w-28" />;
}
