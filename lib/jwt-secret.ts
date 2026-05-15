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

/**
 * Секреты для проверки QR: LOYALTY_QR_SECRET и JWT_SECRET (если различаются).
 * Нужно, чтобы старые QR, подписанные до появления LOYALTY_QR_SECRET, продолжали работать.
 */
export function getLoyaltyQrVerifySecretBytesList(): Uint8Array[] {
  const enc = new TextEncoder();
  const seen = new Set<string>();
  const out: Uint8Array[] = [];

  const add = (raw: string | undefined) => {
    const s = raw?.trim();
    if (!s || s.length < 32 || seen.has(s)) return;
    seen.add(s);
    out.push(enc.encode(s));
  };

  add(process.env.LOYALTY_QR_SECRET);
  add(process.env.JWT_SECRET);

  if (out.length === 0) {
    out.push(getJwtSecretBytes());
  }

  return out;
}
