import Image from "next/image";

export type BrandMarkVariant =
  | "midnight"
  | "cream"
  | "transparent"
  | "mono"
  | "appicon"
  | "favicon";

const MARKS: Record<BrandMarkVariant, string> = {
  midnight: "/brand/olynixx-mark-primary-midnight.svg",
  cream: "/brand/olynixx-mark-light-ground.svg",
  transparent: "/brand/olynixx-mark-primary-transparent.svg",
  mono: "/brand/olynixx-mark-mono-gold.svg",
  appicon: "/brand/olynixx-appicon.svg",
  favicon: "/brand/olynixx-favicon.svg",
};

type Props = {
  variant?: BrandMarkVariant;
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Eight-point khatam star — SVG only, never recoloured or shadowed. */
export function BrandMark({
  variant = "transparent",
  size = 40,
  className = "",
  priority = false,
}: Props) {
  return (
    <Image
      src={MARKS[variant]}
      alt="Olynixx Praxis"
      width={size}
      height={size}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
