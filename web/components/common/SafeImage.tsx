"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(
    src || "https://placehold.co/600x400/png"
  );

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      onError={() => setImgSrc("https://placehold.co/600x400/png")}
    />
  );
}
