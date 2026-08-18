import { appConfig } from "@/config.ts";
import { verify } from "@felix/argon2";
import { timingSafeEqual } from "@std/crypto";

async function isValid(authHEader: string) {
  const match = authHEader.match(/^Basic\s+(.*)$/);
  if (!match) {
    return false;
  }

  let decoded: string;

  try {
    decoded = atob(match[1]);
  } catch {
    return false;
  }

  const separator = decoded.indexOf(":");

  if (separator === -1) {
    return false;
  }

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  const encoder = new TextEncoder();
  const expectedUser = encoder.encode(appConfig.basicAuthUsername || "");
  const encodedUser = encoder.encode(user || "");

  try {
    if (!(await verify(appConfig.basicAuthPasswordHash || "", password))) {
      return false;
    }
  } catch {
    return false;
  }

  return (
    encodedUser.length === expectedUser.length &&
    timingSafeEqual(encodedUser, expectedUser)
  );
}

export async function basicAuth(
  request: Request,
  realm: string = "Restricted Area",
) {
  const authHeader = request.headers.get("Authorization");

  if (await isValid(authHeader ?? "")) {
    return;
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${realm}"` },
  });
}
