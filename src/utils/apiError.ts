export async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return fallback;
  }
  const obj = data as Record<string, unknown> | null;
  const raw = obj?.message ?? obj?.error ?? data;

  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.join(" ");
  if (raw && typeof raw === "object") {
    const nested = (raw as Record<string, unknown>).message;
    if (typeof nested === "string") return nested;
    if (Array.isArray(nested)) return nested.join(" ");
  }
  return fallback;
}
