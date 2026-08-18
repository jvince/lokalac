export function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
