import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useUserImage } from "../hooks/useUserImage";

interface Props {
  src: string;
  alt: string;
  className: string;
  imageClassName: string;
}

export default function ResolvedImage({ src, alt, className, imageClassName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { objectUrl, loading, error } = useUserImage(shouldLoad ? src : "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setShouldLoad(false);

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setShouldLoad(true);
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {objectUrl ? (
        <img
          src={objectUrl}
          alt={alt}
          className={imageClassName}
        />
      ) : error ? (
        <span className="px-2 text-center text-xs text-slate-400">Image unavailable</span>
      ) : (
        <LoaderCircle aria-label={loading ? "Loading image" : "Waiting to load image"} size={20} className="animate-spin text-myinder-blue/60" />
      )}
    </div>
  );
}
