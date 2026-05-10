"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductImagePlaceholder } from "@/components/shop/ProductImagePlaceholder";

type ProductCardImageProps = {
  src: string | null | undefined;
  alt: string;
  /** Родитель с `position: relative` и заданной высотой */
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export function ProductCardImage({
  src,
  alt,
  fill,
  className,
  sizes,
  width = 64,
  height = 64,
}: ProductCardImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = typeof src === "string" ? src.trim() : "";
  const showPhoto = trimmed.length > 0 && !failed;

  useEffect(() => {
    setFailed(false);
  }, [trimmed]);

  if (!showPhoto) {
    if (fill) {
      return (
        <div className="absolute inset-0">
          <ProductImagePlaceholder className="h-full w-full" />
        </div>
      );
    }
    return (
      <div
        className={cn("relative h-full w-full overflow-hidden", className)}
        style={{ minWidth: width, minHeight: height }}
      >
        <ProductImagePlaceholder className="h-full w-full" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        onError={() => setFailed(true)}
        unoptimized={trimmed.startsWith("/")}
      />
    );
  }

  return (
    <Image
      src={trimmed}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      unoptimized={trimmed.startsWith("/")}
    />
  );
}
