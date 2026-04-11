import Image from "next/image";
import Link from "next/link";
import { CSSProperties } from "react";
import weddlyLogo from "@/public/logo/weddlylogo.png";

interface AppLogoProps {
  width?: number;
  height?: number;
  alt?: string;
  href?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}

const AppLogo = ({
  width = 128,
  height = 75,
  alt = "Weddly logo",
  href = "/",
  className,
  style,
  priority = false,
}: AppLogoProps) => {
  const mergedStyle: CSSProperties = {
    width: "100%",
    height: "auto",
    maxWidth: `${width}px`,
    backgroundColor: "transparent",
    backgroundImage: "none",
    ...style,
  };

  return (
    <Link
      href={href}
      className="inline-block w-full bg-transparent p-0"
      style={{ maxWidth: `${width}px` }}
    >
      <Image
        src={weddlyLogo}
        alt={alt}
        className={`block h-auto w-full bg-transparent ${className || ""}`}
        style={mergedStyle}
        sizes={`(max-width: 768px) min(100vw, ${width}px), ${width}px`}
        priority={priority}
      />
    </Link>
  );
};

export default AppLogo;
