/** Читает тело ответа и парсит JSON без выброса при пустом теле или невалидном JSON. */
export async function readResponseJson<T = unknown>(
  res: Response
): Promise<{ status: number; ok: boolean; body: T | null }> {
  const text = await res.text();
  if (!text.trim()) {
    return { status: res.status, ok: res.ok, body: null };
  }
  try {
    return { status: res.status, ok: res.ok, body: JSON.parse(text) as T };
  } catch {
    return { status: res.status, ok: res.ok, body: null };
  }
}
