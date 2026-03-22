import Image from "next/image";
import Link from "next/link";
import { CSSProperties } from "react";

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
  return (
    <Link href={href}>
      <Image
        src="/logo/weddlylogo.png"
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        priority={priority}
      />
    </Link>
  );
};

export default AppLogo;