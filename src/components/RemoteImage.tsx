"use client";

import Image from "next/image";

interface RemoteImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders an absolute https image. The loader stays in this client component
 * so a server page can pass a URL string without sending a function across
 * the server/client boundary.
 */
export default function RemoteImage({
  src,
  alt,
  width,
  height,
  className,
}: RemoteImageProps) {
  if (!src.startsWith("https://")) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      loader={({ src: imageSrc }) => imageSrc}
    />
  );
}
