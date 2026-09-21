const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

export function isIpv4(ip: string): boolean {
  return IPV4_RE.test(ip.trim());
}

/** Map IPv6 loopback / IPv4-mapped forms to IPv4 when possible. */
export function normalizeIp(ip: string): string {
  const value = ip.trim().replace(/^\[|\]$/g, "");

  if (value === "::1" || value === "0:0:0:0:0:0:0:1") {
    return "127.0.0.1";
  }

  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped?.[1]) return mapped[1];

  const mappedHex = value.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
  }

  return value;
}

export function isLoopbackOrPrivateIpv4(ip: string): boolean {
  if (!isIpv4(ip)) return false;
  const [a, b] = ip.split(".").map(Number);
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  return false;
}

export function isPublicIpv4(ip: string): boolean {
  return isIpv4(ip) && !isLoopbackOrPrivateIpv4(ip);
}

/** Accept only a syntactically valid IPv4 from the browser. */
export function sanitizeReportedIpv4(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const ip = normalizeIp(value);
  return isIpv4(ip) ? ip : null;
}

export function pickBestDeviceIpv4(ips: string[]): string | null {
  const unique = [...new Set(ips.map(normalizeIp).filter(isIpv4))];
  const lan = unique.find(
    (ip) => isLoopbackOrPrivateIpv4(ip) && !ip.startsWith("127.")
  );
  if (lan) return lan;
  const loopback = unique.find((ip) => ip.startsWith("127."));
  if (loopback) return loopback;
  return unique[0] ?? null;
}

function collectHeaderIps(headers: Headers): string[] {
  const raw: string[] = [];

  for (const name of [
    "x-forwarded-for",
    "x-vercel-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "true-client-ip",
  ]) {
    const value = headers.get(name);
    if (!value) continue;
    for (const part of value.split(",")) {
      const trimmed = part.trim();
      if (trimmed) raw.push(trimmed);
    }
  }

  return raw.map(normalizeIp);
}

/**
 * Resolve the client IP from proxy / platform headers.
 * Prefers a public IPv4 when present.
 */
export function getClientIp(headers: Headers): string | null {
  const ips = collectHeaderIps(headers);
  if (ips.length === 0) return null;

  const publicIpv4 = ips.find(isPublicIpv4);
  if (publicIpv4) return publicIpv4;

  const anyIpv4 = ips.find(isIpv4);
  if (anyIpv4) return anyIpv4;

  return ips[0] ?? null;
}

/**
 * Prefer a real public IPv4: server headers first, then a validated
 * browser-reported IP (used when local/dev only has ::1 / 127.0.0.1).
 */
export function resolveClientIpv4(
  headers: Headers,
  reportedIp?: string | null
): string | null {
  const fromHeaders = getClientIp(headers);
  const reported = reportedIp ? normalizeIp(reportedIp) : null;

  if (fromHeaders && isPublicIpv4(fromHeaders)) return fromHeaders;
  if (reported && isPublicIpv4(reported)) return reported;
  if (fromHeaders && isIpv4(fromHeaders)) return fromHeaders;
  if (reported && isIpv4(reported)) return reported;
  return fromHeaders;
}

/**
 * Device / connection IPv4: WebRTC LAN IP when present, otherwise the
 * IP from the HTTP connection (so admin isn't empty when Chrome hides LAN IPs).
 */
export function resolveDeviceIpv4(
  headers: Headers,
  reportedDeviceIp?: string | null
): string | null {
  const fromBrowser = sanitizeReportedIpv4(reportedDeviceIp);
  if (fromBrowser && isLoopbackOrPrivateIpv4(fromBrowser) && !fromBrowser.startsWith("127.")) {
    return fromBrowser;
  }

  const fromHeaders = getClientIp(headers);
  if (fromHeaders && isIpv4(fromHeaders)) return fromHeaders;

  if (fromBrowser) return fromBrowser;
  return fromHeaders && isIpv4(normalizeIp(fromHeaders))
    ? normalizeIp(fromHeaders)
    : fromBrowser;
}
