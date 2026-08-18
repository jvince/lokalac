import { assertEquals, assertRejects } from "@std/assert";
import { join } from "@std/path";
import sharp from "sharp";
import { processImages, processImagesAndPersist } from "./imageProcessing.ts";

async function pathExists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

async function createImageFile(
  width: number,
  height: number,
  orientation?: number,
) {
  let image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "red",
    },
  });

  if (orientation !== undefined) {
    image = image.withMetadata({ orientation });
  }

  return new File([await image.jpeg().toBuffer()], "image.jpg", {
    type: "image/jpeg",
  });
}

Deno.test("image processing", async (t) => {
  const uploadDir = await Deno.makeTempDir({
    prefix: "lokalac-image-processing-test-",
  });

  try {
    await t.step("applies EXIF orientation before sizing", async () => {
      const id = "exif";
      const urls = await processImages(
        id,
        [await createImageFile(40, 30, 6)],
        { uploadDir },
      );
      const output = join(uploadDir, id, urls[0].split("/").at(-1)!);
      const metadata = await sharp(output).metadata();

      assertEquals(metadata.width, 30);
      assertEquals(metadata.height, 40);
      assertEquals(metadata.orientation, undefined);
    });

    await t.step(
      "fits landscape and portrait images inside the bounds",
      async () => {
        const cases = [
          { id: "landscape", width: 2000, height: 1500, output: [1440, 1080] },
          { id: "portrait", width: 1500, height: 2000, output: [810, 1080] },
        ];

        for (const testCase of cases) {
          const urls = await processImages(
            testCase.id,
            [await createImageFile(testCase.width, testCase.height)],
            { uploadDir },
          );
          const output = join(
            uploadDir,
            testCase.id,
            urls[0].split("/").at(-1)!,
          );
          const metadata = await sharp(output).metadata();

          assertEquals(
            [metadata.width, metadata.height],
            testCase.output,
            testCase.id,
          );
        }
      },
    );

    await t.step("rejects decoded dimensions over the limit", async () => {
      const id = "dimensions";
      const image = await createImageFile(40, 30);

      await assertRejects(
        () =>
          processImages(id, [image], {
            uploadDir,
            maxDimension: 32,
          }),
        Error,
        "error.image_dimensions_too_large",
      );
      assertEquals(await pathExists(join(uploadDir, id)), false);
    });

    await t.step("rejects images over the decoded pixel limit", async () => {
      const id = "pixels";
      const image = await createImageFile(40, 30);

      await assertRejects(() =>
        processImages(id, [image], {
          uploadDir,
          maxPixels: 1_000,
        })
      );
      assertEquals(await pathExists(join(uploadDir, id)), false);
    });

    await t.step("rejects corrupt image content and cleans up", async () => {
      const id = "corrupt";
      const corrupt = new File(["not an image"], "image.png", {
        type: "image/png",
      });
      const valid = await createImageFile(10, 10);

      await assertRejects(() =>
        processImages(id, [valid, corrupt], {
          uploadDir,
        })
      );
      assertEquals(await pathExists(join(uploadDir, id)), false);
    });

    await t.step("cleans up when persistence fails", async () => {
      const id = "persistence";
      const image = await createImageFile(10, 10);

      await assertRejects(
        () =>
          processImagesAndPersist(
            id,
            [image],
            { uploadDir },
            () => Promise.reject(new Error("storage failed")),
          ),
        Error,
        "storage failed",
      );
      assertEquals(await pathExists(join(uploadDir, id)), false);
    });
  } finally {
    await Deno.remove(uploadDir, { recursive: true });
  }
});
