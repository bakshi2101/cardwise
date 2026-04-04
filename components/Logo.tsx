import Image from "next/image";

type LogoVariant = "default" | "white" | "dark";

const LOGO_FILES: Record<LogoVariant, string> = {
  default: "/logos/cardwise-logo-full.png",
  white:   "/logos/cardwise-logo-white.png",
  dark:    "/logos/cardwise-logo-dark.png",
};

interface LogoProps {
  variant?: LogoVariant;
  /** Height in px — width scales proportionally (logo aspect ~3:1) */
  height?: number;
  className?: string;
}

export default function Logo({
  variant = "default",
  height = 32,
  className,
}: LogoProps) {
  return (
    <Image
      src={LOGO_FILES[variant]}
      alt="CardWise"
      height={height}
      width={height * 3}
      className={className}
      priority
    />
  );
}
