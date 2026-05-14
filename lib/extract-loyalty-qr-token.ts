/**
 * Из «сырого» текста с камеры или буфера достаём компактный JWT (три сегмента base64url).
 * Камера иногда захватывает пробелы, перевод строки или лишний текст вокруг кода.
 */
export function extractLoyaltyQrJwt(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const compact = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (compact.test(s)) return s;
  const m = s.match(/([A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}
