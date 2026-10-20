import { resolveImageUrl } from "./imageService";
import type { SavedUser } from "../types/admin.types";
import type { UniversityRecord } from "./universitiesService";

export const POSTER_WIDTH = 1092;
export const POSTER_HEIGHT = 1440;
export const DEFAULT_POSTER_COLOR = "#FF5A12";

export interface PosterColor {
  color: string;
  usedFallback: boolean;
}

export type PosterProgress =
  | "loading-photo"
  | "removing-background"
  | "drawing-poster";

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
      reject(new Error("The user's first photo could not be decoded as an image."));
    };
    image.src = sourceUrl;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.arcTo(x + width, y, x + width, y + radius, radius);
  context.lineTo(x + width, y + height - radius);
  context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  context.lineTo(x + radius, y + height);
  context.arcTo(x, y + height, x, y + height - radius, radius);
  context.lineTo(x, y + radius);
  context.arcTo(x, y, x + radius, y, radius);
  context.closePath();
}

function drawInstagramIcon(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 6;
  drawRoundedRect(context, x, y, 48, 48, 12);
  context.stroke();
  context.beginPath();
  context.arc(x + 24, y + 24, 11, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(x + 36, y + 12, 2.5, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function drawGraduationCap(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y + 16);
  context.lineTo(x + 34, y);
  context.lineTo(x + 68, y + 16);
  context.lineTo(x + 34, y + 32);
  context.closePath();
  context.fill();
  context.fillRect(x + 12, y + 22, 44, 16);
  context.beginPath();
  context.moveTo(x + 63, y + 18);
  context.lineTo(x + 63, y + 39);
  context.strokeStyle = color;
  context.lineWidth = 4;
  context.stroke();
  context.beginPath();
  context.arc(x + 63, y + 42, 5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawAvatar(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  centerX: number,
  centerY: number,
  radius: number,
  color: string,
): void {
  context.save();
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.strokeStyle = color;
  context.lineWidth = 4;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.stroke();
  context.clip();
  drawCoverImage(
    context,
    image,
    centerX - radius + 4,
    centerY - radius + 4,
    (radius - 4) * 2,
    (radius - 4) * 2,
  );
  context.restore();
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  weight = 700,
): string {
  let size = startSize;
  context.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  while (context.measureText(text).width > maxWidth && size > 24) {
    size -= 2;
    context.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  }
  return context.font;
}

function drawPoster(
  photo: HTMLImageElement,
  cutout: HTMLImageElement,
  user: SavedUser,
  university: UniversityRecord,
  color: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare the poster canvas.");

  context.fillStyle = "#171719";
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  context.save();
  context.filter = "blur(28px) brightness(0.62)";
  drawCoverImage(context, photo, -24, -24, POSTER_WIDTH + 48, POSTER_HEIGHT + 48);
  context.restore();

  const bottomShade = context.createLinearGradient(0, 520, 0, POSTER_HEIGHT);
  bottomShade.addColorStop(0, "rgba(8, 9, 12, 0.04)");
  bottomShade.addColorStop(0.48, "rgba(8, 9, 12, 0.48)");
  bottomShade.addColorStop(1, "rgba(8, 9, 12, 0.95)");
  context.fillStyle = bottomShade;
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  const figureWidth = POSTER_WIDTH - 150;
  const figureHeight = 1120;
  const figureScale = Math.min(figureWidth / cutout.width, figureHeight / cutout.height);
  const drawnWidth = cutout.width * figureScale;
  const drawnHeight = cutout.height * figureScale;
  context.drawImage(
    cutout,
    (POSTER_WIDTH - drawnWidth) / 2,
    28 + (figureHeight - drawnHeight) / 2,
    drawnWidth,
    drawnHeight,
  );

  const lowerShade = context.createLinearGradient(0, 790, 0, 1370);
  lowerShade.addColorStop(0, "rgba(10, 11, 14, 0)");
  lowerShade.addColorStop(0.4, "rgba(10, 11, 14, 0.55)");
  lowerShade.addColorStop(1, "rgba(10, 11, 14, 0.88)");
  context.fillStyle = lowerShade;
  context.fillRect(0, 760, POSTER_WIDTH, 680);

  context.save();
  context.shadowColor = color;
  context.shadowBlur = 24;
  context.strokeStyle = color;
  context.lineWidth = 4;
  drawRoundedRect(context, 76, 108, 940, 1176, 48);
  context.stroke();
  context.restore();

  context.fillStyle = "#FF5A12";
  drawRoundedRect(context, 110, 140, 198, 62, 28);
  context.fill();
  context.fillStyle = "#FFFFFF";
  context.font = "700 34px Inter, Arial, sans-serif";
  context.textBaseline = "middle";
  context.fillText("mylnder", 128, 171);

  context.fillStyle = "#FFFFFF";
  context.textBaseline = "alphabetic";
  const displayName = user.name.trim() || "Myinder member";
  context.font = fitText(context, displayName, 800, 68);
  context.fillText(displayName, 128, 970, 810);

  drawInstagramIcon(context, 130, 1006, color);
  const rawInstagram = user.instagram.replace(/^@+/, "").trim();
  const instagram =
    rawInstagram && !/^not provided$/i.test(rawInstagram)
      ? `@${rawInstagram}`
      : "Instagram not provided";
  context.font = "500 34px Inter, Arial, sans-serif";
  context.fillStyle = "#FFFFFF";
  context.fillText(instagram, 203, 1040, 620);

  context.fillStyle = color;
  drawRoundedRect(context, 130, 1086, 250, 7, 4);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.76)";
  context.font = "600 20px Inter, Arial, sans-serif";
  context.fillText(university.name, 130, 1132, 620);

  drawGraduationCap(context, 130, 1160, color);
  context.fillStyle = "#FFFFFF";
  context.font = fitText(context, user.major.trim() || "Course not provided", 600, 32, 600);
  context.fillText(user.major.trim() || "Course not provided", 215, 1197, 610);

  drawAvatar(context, photo, 892, 1180, 66, color);
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

export async function generateAdminUserPoster(
  user: SavedUser,
  university: UniversityRecord,
  onProgress?: (progress: PosterProgress) => void,
): Promise<Blob> {
  const firstPhoto = user.posterPhotoUrl?.trim();
  if (!firstPhoto) {
    throw new Error("This user has no usable first photo. Add a photo before generating a poster.");
  }
  if (!university.id || !university.name.trim()) {
    throw new Error("The user's university could not be resolved.");
  }

  onProgress?.("loading-photo");
  let response: Response;
  try {
    const resolvedUrl = await resolveImageUrl(firstPhoto);
    response = await fetch(resolvedUrl);
  } catch {
    throw new Error("The user's first photo is unavailable. Check image access and try again.");
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("You are not authorized to access this user's first photo. Sign in again or check admin permissions.");
    }
    throw new Error(`The user's first photo could not be loaded (HTTP ${response.status}).`);
  }
  let photoBlob: Blob;
  try {
    photoBlob = await response.blob();
  } catch {
    throw new Error("The user's first photo could not be read. Check image access and try again.");
  }
  if (!photoBlob.type.startsWith("image/")) {
    throw new Error("The user's first photo did not return a valid image.");
  }

  const photo = await loadImage(photoBlob);
  onProgress?.("removing-background");
  let cutoutBlob: Blob;
  try {
    const { removeBackground } = await import("@imgly/background-removal");
    cutoutBlob = await removeBackground(photoBlob, {
      model: "isnet_quint8",
      output: { format: "image/png" },
    });
  } catch {
    throw new Error(
      "Background removal failed. Check your connection and browser memory, then try again.",
    );
  }
  const cutout = await loadImage(cutoutBlob);

  onProgress?.("drawing-poster");
  const { color } = getPosterColor(university);
  return canvasToBlob(drawPoster(photo, cutout, user, university, color));
}
