import Image from "next/image"

// Re-export Next.js Image for convenience
export { Image as nextImage }

// Base URL for optimized images (can be configured via env)
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_CDN || ""

/**
 * Build an optimized image URL with optional transforms
 * @param src - Image source (path or full URL)
 * @param options - Transform options
 */
export function getImageUrl(
  src: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: "webp" | "avif" | "original"
  }
): string {
  // If it's already a full URL, return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src
  }

  // Build optimized URL with query params
  const params = new URLSearchParams()
  if (options?.width) params.set("w", String(options.width))
  if (options?.height) params.set("h", String(options.height))
  if (options?.quality) params.set("q", String(options.quality))
  if (options?.format && options.format !== "original") {
    params.set("f", options.format)
  }

  const queryString = params.toString()
  return queryString ? `${IMAGE_BASE_URL}${src}?${queryString}` : `${IMAGE_BASE_URL}${src}`
}

export interface BlurhashPlaceholder {
  src: string
  width: number
  height: number
  blurDataURL?: string
}

/**
 * Generate a blur placeholder for an image
 * @param width - Image width
 * @param height - Image height
 * @returns Data URL for blur placeholder
 */
export function blurhashPlaceholder(width: number, height: number): string {
  // Generate a simple SVG-based blur placeholder
  // For production, integrate with blurhash library
  const aspectRatio = height / width
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><filter id="b"><feGaussianBlur stdDeviation="12"/></filter><rect width="100%" height="100%" fill="hsl(220, 20%, 95%)" filter="url(#b)"/></svg>`
  const base64 = Buffer.from(svg).toString("base64")
  return `data:image/svg+xml;base64,${base64}`
}

// Default image props for consistent behavior
export const defaultImageProps = {
  loading: "lazy" as const,
  sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}

// Create an optimized Next.js Image component wrapper
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  fill?: boolean
  className?: string
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

/**
 * Create a fully configured Next.js Image component
 * with lazy loading and priority support
 */
export function createOptimizedImage(props: OptimizedImageProps) {
  const {
    src,
    alt,
    width,
    height,
    priority = false,
    fill = false,
    className,
    placeholder = "empty",
    blurDataURL,
  } = props

  const imageProps: React.ComponentProps<typeof Image> = {
    src,
    alt,
    fill,
    className,
    placeholder,
    loading: priority ? "eager" : "lazy",
    priority,
    ...(!fill && { width, height }),
  }

  if (placeholder === "blur" && !blurDataURL) {
    imageProps.blurDataURL = blurhashPlaceholder(width ?? 400, height ?? 300)
  } else if (blurDataURL) {
    imageProps.blurDataURL = blurDataURL
  }

  return imageProps
}