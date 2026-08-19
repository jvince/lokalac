import "@std/dotenv/load";

export interface AppConfig {
  kvStorageDir: string;
  uploadDir: string;
  basicAuthUsername?: string;
  basicAuthPasswordHash?: string;
}

export const appConfig: AppConfig = {
  kvStorageDir: Deno.env.get("KV_STORAGE_DIR") || "data",
  uploadDir: Deno.env.get("UPLOAD_DIR") || "upload",
  basicAuthUsername: Deno.env.get("BASIC_AUTH_USERNAME"),
  basicAuthPasswordHash: Deno.env.get("BASIC_AUTH_PASSWORD_HASH"),
};

if (!appConfig.basicAuthUsername || !appConfig.basicAuthPasswordHash) {
  throw new Error(
    "BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD_HASH must be set in the environment variables.",
  );
}
