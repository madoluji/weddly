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
    height: "auto",
    backgroundColor: "transparent",
    backgroundImage: "none",
    ...style,
  };

  return (
    <Link href={href} className="bg-transparent inline-block p-0">
      <Image
        src={weddlyLogo}
        alt={alt}
        width={width}
        height={height}
        className={`bg-transparent block ${className || ""}`}
        style={mergedStyle}
        priority={priority}
      />
    </Link>
  );
};

export default AppLogo;