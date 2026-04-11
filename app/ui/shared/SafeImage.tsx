import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type SafeImageProps = ImageProps & {
  style?: CSSProperties;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = "/images/image.png";

const normalizeStringSource = (value: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const lowered = trimmed.toLowerCase();
  if (["undefined", "null", "nan", "n/a", "none"].includes(lowered)) {
    return null;
  }

  if (
    trimmed.startsWith("/") ||
    /^https?:\/\//.test(trimmed) ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("public/")) {
    return `/${trimmed.slice("public/".length)}`;
  }

  if (trimmed.startsWith("images/")) {
    return `/${trimmed}`;
  }

  return null;
};

const normalizeSource = (
  src: ImageProps["src"],
  fallbackSrc: string
): ImageProps["src"] => {
  if (typeof src === "string") {
    return normalizeStringSource(src) ?? fallbackSrc;
  }

  return src || fallbackSrc;
};

const shouldDisableOptimization = (src: ImageProps["src"]) =>
  typeof src === "string" && /^(https?:\/\/|blob:|data:)/.test(src);

export default function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  unoptimized,
  style,
  onError,
  ...props
}: SafeImageProps) {
  const [safeSrc, setSafeSrc] = useState<ImageProps["src"]>(() =>
    normalizeSource(src, fallbackSrc)
  );

  useEffect(() => {
    setSafeSrc(normalizeSource(src, fallbackSrc));
  }, [fallbackSrc, src]);

  return (
    <Image
      src={safeSrc}
      unoptimized={unoptimized ?? shouldDisableOptimization(safeSrc)}
      style={style}
      onError={(event) => {
        if (typeof safeSrc === "string" && safeSrc !== fallbackSrc) {
          setSafeSrc(fallbackSrc);
        }
        onError?.(event);
      }}
      {...props}
    />
  );
}
