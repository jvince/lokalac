export function isValidUlid(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const ulidRegex = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
  return ulidRegex.test(value);
}
