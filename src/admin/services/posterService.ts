import { resolveImageUrl } from "./imageService";
import type { SavedUser } from "../types/admin.types";
import type { UniversityRecord } from "./universitiesService";

export const POSTER_WIDTH = 768;
export const POSTER_HEIGHT = 1024;
export const DEFAULT_POSTER_COLOR = "#FF5A12";

export interface PosterColor {
  color: string;
  usedFallback: boolean;
}

export type PosterProgress = "loading-photo" | "drawing-poster";

export function getPosterColor(university: UniversityRecord): PosterColor {
  const configured = university.customColor?.trim() ?? "";
  if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(configured)) {
    return { color: configured, usedFallback: false };
  }
  return { color: DEFAULT_POSTER_COLOR, usedFallback: true };
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("The selected photo could not be decoded as an image."));
    };
    image.src = sourceUrl;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
): void {
  const scale = Math.max(
    POSTER_WIDTH / image.naturalWidth,
    POSTER_HEIGHT / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (POSTER_WIDTH - drawWidth) / 2,
    (POSTER_HEIGHT - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawInstagramIcon(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  context.save();
  context.strokeStyle = color;
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(x, y, 28, 28, 7);
  context.stroke();
  context.beginPath();
  context.arc(x + 14, y + 14, 6.5, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(x + 21, y + 7, 1.5, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function drawPoster(
  photo: HTMLImageElement,
  user: SavedUser,
  color: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare the poster canvas.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  drawCoverImage(context, photo);

  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2.5;
  context.beginPath();
  context.roundRect(21, 15, POSTER_WIDTH - 42, POSTER_HEIGHT - 30, 22);
  context.stroke();
  context.restore();

  context.save();
  context.fillStyle = color;
  context.textAlign = "right";
  context.textBaseline = "middle";
  context.font = "500 14px Arial, sans-serif";
  context.fillText("mylnder.com", POSTER_WIDTH - 49, 57);

  drawInstagramIcon(context, 54, POSTER_HEIGHT - 114, color);
  context.textAlign = "left";
  context.font = "500 18px Arial, sans-serif";
  const instagram = user.instagram.replace(/^@+/, "").trim();
  context.fillText(
    instagram && !/^not provided$/i.test(instagram) ? `@${instagram}` : "Instagram not provided",
    98,
    POSTER_HEIGHT - 99,
    POSTER_WIDTH - 155,
  );
  context.restore();

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The poster could not be exported as a PNG."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

async function fetchSelectedPhoto(photoUrl: string): Promise<Blob> {
  let resolvedUrl = await resolveImageUrl(photoUrl, { refresh: true });
  let response: Response;

  try {
    response = await fetch(resolvedUrl, { cache: "no-store" });
  } catch {
    throw new Error(
      "The photo could not be reached. Check your connection and the image server's CORS settings.",
    );
  }

  if (
    !response.ok &&
    [401, 403, 404].includes(response.status) &&
    new URL(photoUrl, window.location.origin).pathname.startsWith("/api/images/")
  ) {
    resolvedUrl = await resolveImageUrl(photoUrl, { refresh: true });
    try {
      response = await fetch(resolvedUrl, { cache: "no-store" });
    } catch {
      throw new Error(
        "The refreshed photo URL could not be reached. Check image access and storage CORS settings.",
      );
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("You are not authorized to access this photo. Sign in again or check admin permissions.");
    }
    throw new Error(`The selected photo could not be loaded (HTTP ${response.status}).`);
  }

  const photoBlob = await response.blob();
  if (!photoBlob.type.startsWith("image/")) {
    throw new Error("The selected photo did not return a valid image.");
  }
  return photoBlob;
}

export async function generateAdminUserPoster(
  user: SavedUser,
  university: UniversityRecord,
  photoUrl: string,
  onProgress?: (progress: PosterProgress) => void,
): Promise<Blob> {
  const selectedPhoto = photoUrl.trim();
  if (!selectedPhoto) {
    throw new Error("Select a user photo before generating a poster.");
  }
  if (!university.id || !university.name.trim()) {
    throw new Error("The user's university could not be resolved.");
  }

  onProgress?.("loading-photo");
  const photoBlob = await fetchSelectedPhoto(selectedPhoto);
  const photo = await loadImage(photoBlob);

  onProgress?.("drawing-poster");
  const { color } = getPosterColor(university);
  return canvasToBlob(drawPoster(photo, user, color));
}
