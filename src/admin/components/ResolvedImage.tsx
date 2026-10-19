import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { resolveImageUrl } from "../services/imageService";

interface Props {
  src: string;
  alt: string;
  className: string;
  imageClassName: string;
}

export default function ResolvedImage({ src, alt, className, imageClassName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const container = containerRef.current;
    setResolvedUrl("");
    setFailed(false);
    if (!container) return;

    const resolve = () => {
      resolveImageUrl(src)
        .then((url) => {
          if (active) setResolvedUrl(url);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    };

    if (!("IntersectionObserver" in window)) {
      resolve();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          resolve();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(container);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [src]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={alt}
          loading="lazy"
          className={imageClassName}
          onError={() => setFailed(true)}
        />
      ) : failed ? (
        <span className="px-2 text-center text-xs text-slate-400">Image unavailable</span>
      ) : (
        <LoaderCircle aria-label="Loading image" size={20} className="animate-spin text-myinder-blue/60" />
      )}
    </div>
  );
}
