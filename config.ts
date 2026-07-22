import "@std/dotenv/load";

export interface AppConfig {
  kvStorageDir: string;
  uploadDir: string;
}

export const appConfig: AppConfig = {
  kvStorageDir: Deno.env.get("KV_STORAGE_DIR") || "data",
  uploadDir: Deno.env.get("UPLOAD_DIR") || "upload",
};
