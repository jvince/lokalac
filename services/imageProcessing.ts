import type { Semaphore } from "@/services/semaphore.ts";
import { createSemaphore } from "@/services/semaphore.ts";
import {
  FileSystemImageStorage,
  type ImageStorage,
  imageStorage,
  imageUrl,
} from "@/services/imageStorage.ts";
import sharp, { type Metadata, type Sharp } from "sharp";

export const MAX_IMAGE_PIXELS = 40_000_000;
export const MAX_IMAGE_DIMENSION = 12_000;
export const IMAGE_PROCESSING_TIMEOUT_SECONDS = 5;
export const MAX_CONCURRENT_IMAGE_SUBMISSIONS = 2;
export const IMAGE_PROCESSING_QUEUE_TIMEOUT_MS = 5_000;

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
const imageProcessingSemaphore = createSemaphore(
  MAX_CONCURRENT_IMAGE_SUBMISSIONS,
);

export class ImageValidationError extends Error {}

export interface ImageProcessingOptions {
  maxDimension?: number;
  maxPixels?: number;
  queueTimeoutMs?: number;
  semaphore?: Semaphore;
  timeoutSeconds?: number;
  storage?: ImageStorage;
  uploadDir?: string;
}

function resolveStorage(options: ImageProcessingOptions): ImageStorage {
  return options.storage ||
    (options.uploadDir
      ? new FileSystemImageStorage(options.uploadDir)
      : imageStorage);
}

export async function removeProcessedImages(
  id: string,
  storage: ImageStorage,
) {
  try {
    await storage.deleteIssue(id);
  } catch (error) {
    console.error(`Failed to clean up images for issue ${id}:`, error);
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
    ...storageOptions
  }: ImageProcessingOptions,
) {
  if (!files.length) {
    return [];
  }

  return await semaphore.run(async () => {
    const storage = resolveStorage(storageOptions);
    const imageUrls: string[] = [];

    try {
      for (const file of files) {
        let image: Sharp;
        let metadata: Metadata;

        try {
          image = sharp(await file.bytes(), {
            limitInputPixels: maxPixels,
          });
          metadata = await image.metadata();
        } catch (cause) {
          throw new ImageValidationError("error.image_invalid", { cause });
        }

        if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
          throw new ImageValidationError("error.image_invalid_type");
        }

        if (metadata.pages && metadata.pages > 1) {
          throw new ImageValidationError("error.animated_image_not_allowed");
        }

        if (
          !metadata.width ||
          !metadata.height ||
          metadata.width > maxDimension ||
          metadata.height > maxDimension ||
          metadata.width * metadata.height > maxPixels
        ) {
          throw new ImageValidationError("error.image_dimensions_too_large");
        }

        const fileName = `${crypto.randomUUID()}.webp`;
        const buffer = await image.autoOrient().resize({
          width: 1920,
          height: 1080,
          fit: "inside",
          withoutEnlargement: true,
        }).timeout({ seconds: timeoutSeconds }).webp().toBuffer();

        await storage.put(id, fileName, buffer);
        imageUrls.push(imageUrl(id, fileName));
      }

      return imageUrls;
    } catch (error) {
      await removeProcessedImages(id, storage);
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
  const storage = resolveStorage(options);
  try {
    const imageUrls = await processImages(id, files, { ...options, storage });
    return await persist(imageUrls);
  } catch (error) {
    await removeProcessedImages(id, storage);
    throw error;
  }
}
