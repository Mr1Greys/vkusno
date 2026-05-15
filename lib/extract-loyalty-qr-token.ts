/** Префикс в QR-коде: отличает бонусный JWT от посторонних QR на экране. */
export const LOYALTY_QR_PREFIX = "L1|";

export function encodeLoyaltyQrPayload(jwt: string): string {
  return `${LOYALTY_QR_PREFIX}${jwt}`;
}

/**
 * Из «сырого» текста с камеры или буфера достаём компактный JWT (три сегмента base64url).
 * Камера иногда захватывает пробелы, перевод строки или лишний текст вокруг кода.
 */
export function extractLoyaltyQrJwt(raw: string): string | null {
  const s = raw.trim().replace(/\s+/g, "");
  if (!s) return null;

  const prefixed = new RegExp(
    `^${LOYALTY_QR_PREFIX.replace("|", "\\|")}([A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)$`,
    "i"
  );
  const prefixedMatch = s.match(prefixed);
  if (prefixedMatch) return prefixedMatch[1];

  const compact = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (compact.test(s)) return s;

  const eyJ = s.match(/(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
  return eyJ ? eyJ[1] : null;
}
