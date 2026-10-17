import { useEffect, useState } from "react";
import { Download, Instagram, University, GraduationCap, X, LoaderCircle, Music2 } from "lucide-react";
import JSZip from "jszip";
import type { SavedUser } from "../types/admin.types";

export default function UserDetailsModal({ user, onClose }: { user: SavedUser | null; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [user, onClose]);

  useEffect(() => { setError(""); }, [user?.id]);

  if (!user) return null;

  const saveImage = async (url: string, index: number) => {
    try {
      setError("");
      const response = await fetch(url);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${user.name.replace(/\s+/g, "-")}-image-${index + 1}.${blob.type.split("/")[1]?.split(";")[0] || "jpg"}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError("Unable to download this image. Check the image URL and CORS settings.");
    }
  };

  const saveAll = async () => {
    if (!user.images.length) return;
    setDownloading(true);
    setError("");
    try {
      const zip = new JSZip();
      const folder = zip.folder(user.name.replace(/[^a-z0-9]/gi, "-") || "user-images");
      if (!folder) throw new Error("Unable to create ZIP");
      await Promise.all(user.images.map(async (url, index) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Image request failed");
        const blob = await response.blob();
        const extension = blob.type.split("/")[1]?.split(";")[0] || "jpg";
        folder.file(`image-${index + 1}.${extension}`, blob);
      }));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const objectUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${user.name.replace(/\s+/g, "-")}-images.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError("Could not download every image. Check that image URLs are accessible and allow CORS.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/50 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-user-name" className="relative flex max-h-[88vh] w-full max-w-[805px] flex-col overflow-hidden rounded-xl border border-blue-100 bg-white shadow-2xl">
        <button onClick={onClose} aria-label="Close user details" className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-myinder-blue transition hover:bg-blue-50"><X size={24}/></button>
        <div className="flex shrink-0 items-center gap-5 border-b border-blue-100 px-6 py-7 pr-14 sm:px-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-myinder-blue"><University size={40}/></div>
          <div className="min-w-0">
            <h2 id="modal-user-name" className="text-xl font-extrabold text-myinder-navy sm:text-2xl">{user.name}</h2>
            <p className="mt-2 flex items-center gap-3 text-sm text-myinder-muted sm:text-base"><University size={20} className="shrink-0 text-myinder-blue"/>{user.university}</p>
            <p className="mt-2 flex items-center gap-3 text-sm text-myinder-muted sm:text-base"><GraduationCap size={21} className="shrink-0 text-myinder-blue"/>{user.major}</p>
            <p className="mt-2 flex items-center gap-3 text-sm text-myinder-muted sm:text-base"><Instagram size={21} className="shrink-0 text-pink-500"/>{user.instagram}</p>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5 sm:px-8">
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <section className="rounded-lg bg-blue-50/70 p-4">
              <h3 className="text-sm font-bold text-myinder-navy">Bio</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-myinder-muted">{user.bio || "No bio provided."}</p>
            </section>
            <section className="rounded-lg bg-blue-50/70 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-myinder-navy"><Music2 size={17} className="text-myinder-blue"/>Song</h3>
              <p className="mt-2 text-sm text-myinder-muted">{user.song || "No song selected."}</p>
            </section>
          </div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-myinder-navy">User Photos</h3>
            <button onClick={saveAll} disabled={downloading || user.images.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-myinder-orange px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-60 sm:text-sm">
              {downloading ? <LoaderCircle size={18} className="animate-spin"/> : <Download size={19}/>}
              {downloading ? "Preparing ZIP..." : `Download All Images (${user.images.length})`}
            </button>
          </div>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {user.images.length ? (
            <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 md:grid-cols-3">
              {user.images.map((url, index) => (
                <article key={`${url}-${index}`} className="group relative aspect-[1.08/1] overflow-hidden rounded-lg bg-blue-50">
                  <img src={url} alt={`${user.name} photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/>
                  <button onClick={() => void saveImage(url, index)} aria-label={`Download photo ${index + 1}`} className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-myinder-blue shadow-md transition hover:bg-blue-50"><Download size={20}/></button>
                </article>
              ))}
            </div>
          ) : <p className="py-12 text-center text-sm text-slate-500">No images available for this user.</p>}
        </div>
      </section>
    </div>
  );
}