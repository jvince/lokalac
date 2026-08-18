import type { Semaphore } from "@/services/semaphore.ts";
import { createSemaphore } from "@/services/semaphore.ts";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import sharp from "sharp";

export const MAX_IMAGE_PIXELS = 40_000_000;
export const MAX_IMAGE_DIMENSION = 12_000;
export const IMAGE_PROCESSING_TIMEOUT_SECONDS = 5;
export const MAX_CONCURRENT_IMAGE_SUBMISSIONS = 2;
export const IMAGE_PROCESSING_QUEUE_TIMEOUT_MS = 5_000;

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
const imageProcessingSemaphore = createSemaphore(
  MAX_CONCURRENT_IMAGE_SUBMISSIONS,
);

export interface ImageProcessingOptions {
  maxDimension?: number;
  maxPixels?: number;
  queueTimeoutMs?: number;
  semaphore?: Semaphore;
  timeoutSeconds?: number;
  uploadDir: string;
}

export async function removeProcessedImages(id: string, uploadDir: string) {
  try {
    await Deno.remove(join(uploadDir, id), { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.error(`Failed to clean up images for issue ${id}:`, error);
    }
  }
}

export async function processImages(
  id: string,
  files: File[],
  {
    maxDimension = MAX_IMAGE_DIMENSION,
    maxPixels = MAX_IMAGE_PIXELS,
    queueTimeoutMs = IMAGE_PROCESSING_QUEUE_TIMEOUT_MS,
    semaphore = imageProcessingSemaphore,
    timeoutSeconds = IMAGE_PROCESSING_TIMEOUT_SECONDS,
    uploadDir,
  }: ImageProcessingOptions,
) {
  if (!files.length) {
    return [];
  }

  return await semaphore.run(async () => {
    const issueDirectory = join(uploadDir, id);
    await ensureDir(issueDirectory);
    const imageUrls: string[] = [];

    try {
      for (const file of files) {
        const image = sharp(await file.bytes(), {
          limitInputPixels: maxPixels,
        });
        const metadata = await image.metadata();

        if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
          throw new Error("error.image_invalid_type");
        }

        if (metadata.pages && metadata.pages > 1) {
          throw new Error("error.animated_image_not_allowed");
        }

        if (
          !metadata.width ||
          !metadata.height ||
          metadata.width > maxDimension ||
          metadata.height > maxDimension ||
          metadata.width * metadata.height > maxPixels
        ) {
          throw new Error("error.image_dimensions_too_large");
        }

        const fileName = `${crypto.randomUUID()}.webp`;
        const buffer = await image.autoOrient().resize({
          width: 1920,
          height: 1080,
          fit: "inside",
          withoutEnlargement: true,
        }).timeout({ seconds: timeoutSeconds }).webp().toBuffer();

        await Deno.writeFile(join(issueDirectory, fileName), buffer);
        imageUrls.push(`/${uploadDir}/${id}/${fileName}`);
      }

      return imageUrls;
    } catch (error) {
      await removeProcessedImages(id, uploadDir);
      throw error;
    }
  }, queueTimeoutMs);
}

export async function processImagesAndPersist<T>(
  id: string,
  files: File[],
  options: ImageProcessingOptions,
  persist: (imageUrls: string[]) => Promise<T>,
): Promise<T> {
  try {
    const imageUrls = await processImages(id, files, options);
    return await persist(imageUrls);
  } catch (error) {
    await removeProcessedImages(id, options.uploadDir);
    throw error;
  }
}
