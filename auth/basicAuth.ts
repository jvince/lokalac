import { timingSafeEqual } from "@std/crypto";

function isValid(authHEader: string) {
  const match = authHEader.match(/^Basic\s+(.*)$/);
  if (!match) {
    return false;
  }

  const [user, password] = atob(match[1]).split(":");
  const encoder = new TextEncoder();

  const expectedUser = encoder.encode("test");
  const expectedPassword = encoder.encode("test");
  const encodedUser = encoder.encode(user || "");
  const encodedPassword = encoder.encode(password || "");

  if (
    encodedUser.length === expectedUser.length &&
    encodedPassword.length === expectedPassword.length &&
    timingSafeEqual(encodedUser, expectedUser) &&
    timingSafeEqual(encodedPassword, expectedPassword)
  ) {
    return true;
  }

  return false;
}

export function basicAuth(request: Request, realm: string = "Restricted Area") {
  const authHeader = request.headers.get("Authorization");

  if (isValid(authHeader ?? "")) {
    return;
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${realm}"` },
  });
}
