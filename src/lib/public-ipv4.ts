/**
 * Fetch the browser's public IPv4 (used when server only sees localhost).
 */
export async function fetchPublicIpv4(): Promise<string | null> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return typeof data.ip === "string" ? data.ip.trim() : null;
  } catch {
    return null;
  }
}
