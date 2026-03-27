import Image, { ImageProps } from "next/image";

type SafeImageProps = ImageProps;

const shouldDisableOptimization = (src: ImageProps["src"]) =>
  typeof src === "string" && /^(https?:\/\/|blob:|data:)/.test(src);

export default function SafeImage({ src, unoptimized, ...props }: SafeImageProps) {
  return (
    <Image
      src={src}
      unoptimized={unoptimized ?? shouldDisableOptimization(src)}
      {...props}
    />
  );
}
