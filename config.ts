import "@std/dotenv/load";

export interface AppConfig {
  kvStorageDir: string;
  uploadDir: string;
  imageStorage: "filesystem" | "s3";
  uploadBucket?: string;
  awsRegion?: string;
  uploadPrefix: string;
  isDenoDeploy: boolean;
  basicAuthUsername?: string;
  basicAuthPasswordHash?: string;
}

const isDenoDeploy = Deno.env.get("DENO_DEPLOY") === "true";
const configuredImageStorage = Deno.env.get("IMAGE_STORAGE") ||
  (isDenoDeploy ? "s3" : "filesystem");

if (
  configuredImageStorage !== "filesystem" && configuredImageStorage !== "s3"
) {
  throw new Error("IMAGE_STORAGE must be either filesystem or s3.");
}

export const appConfig: AppConfig = {
  kvStorageDir: Deno.env.get("KV_STORAGE_DIR") || "data",
  uploadDir: Deno.env.get("UPLOAD_DIR") || "upload",
  imageStorage: configuredImageStorage,
  uploadBucket: Deno.env.get("UPLOAD_BUCKET"),
  awsRegion: Deno.env.get("AWS_REGION"),
  uploadPrefix: Deno.env.get("UPLOAD_PREFIX") ||
    Deno.env.get("DENO_TIMELINE") || "local",
  isDenoDeploy,
  basicAuthUsername: Deno.env.get("BASIC_AUTH_USERNAME"),
  basicAuthPasswordHash: Deno.env.get("BASIC_AUTH_PASSWORD_HASH"),
};

export function validateRuntimeConfig(config: AppConfig = appConfig): void {
  if (!config.basicAuthUsername || !config.basicAuthPasswordHash) {
    throw new Error(
      "BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD_HASH must be set in the environment variables.",
    );
  }

  if (config.isDenoDeploy && config.imageStorage !== "s3") {
    throw new Error("Deno Deploy must use S3 image storage.");
  }

  if (config.imageStorage === "s3" && !config.uploadBucket) {
    throw new Error("UPLOAD_BUCKET must be set when IMAGE_STORAGE=s3.");
  }

  if (config.imageStorage === "s3" && !config.awsRegion) {
    throw new Error("AWS_REGION must be set when IMAGE_STORAGE=s3.");
  }
}
