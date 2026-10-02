import Image from "next/image";

export default function Brand({ size = 52 }) {
  return (
    <Image
      src="/hathcocked-logo.png"
      alt="Hathcocked Recipes"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}
