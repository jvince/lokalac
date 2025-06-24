export const colorsUI = [
  "neutral",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
] as const;

export type ColorUI = (typeof colorsUI)[number];

export const variantsUI = [
  "outline",
  "dash",
  "soft",
  "ghost",
  "link",
] as const;

export type VariantUI = (typeof variantsUI)[number];

export const sizesUI = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
] as const;

export type SizeUI = (typeof sizesUI)[number];
