const DEV_PLACEHOLDER =
  "dev-only-insecure-placeholder-min-32-characters-long!!";

export function getJwtSecretBytes(): Uint8Array {
  const s = process.env.JWT_SECRET?.trim();
  if (s && s.length >= 32) {
    return new TextEncoder().encode(s);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET must be set to a string of at least 32 characters in production"
    );
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[auth] JWT_SECRET is missing or short; using insecure dev placeholder"
    );
  }
  return new TextEncoder().encode(DEV_PLACEHOLDER);
}

/** Отдельный секрет для QR лояльности; иначе тот же, что и JWT (достаточно ≥32 символов). */
export function getLoyaltyQrSecretBytes(): Uint8Array {
  const s = process.env.LOYALTY_QR_SECRET?.trim();
  if (s && s.length >= 32) {
    return new TextEncoder().encode(s);
  }
  return getJwtSecretBytes();
}
