import Image, { ImageProps } from "next/image";
import type { CSSProperties } from "react";

type SafeImageProps = ImageProps & {
  style?: CSSProperties;
};

const shouldDisableOptimization = (src: ImageProps["src"]) =>
  typeof src === "string" && /^(https?:\/\/|blob:|data:)/.test(src);

export default function SafeImage({
  src,
  unoptimized,
  style,
  ...props
}: SafeImageProps) {
  return (
    <Image
      src={src}
      unoptimized={unoptimized ?? shouldDisableOptimization(src)}
      style={style}
      {...props}
    />
  );
}
