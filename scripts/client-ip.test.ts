import assert from "node:assert/strict";
import {
  getClientIp,
  isIpv4,
  normalizeIp,
  resolveClientIpv4,
  sanitizeReportedIpv4,
} from "../src/lib/client-ip.ts";

function headers(init: Record<string, string>) {
  return new Headers(init);
}

assert.equal(normalizeIp("::1"), "127.0.0.1");
assert.equal(normalizeIp("::ffff:203.0.113.10"), "203.0.113.10");
assert.equal(isIpv4("203.0.113.10"), true);
assert.equal(isIpv4("::1"), false);

assert.equal(
  getClientIp(headers({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" })),
  "203.0.113.10"
);
assert.equal(getClientIp(headers({ "x-real-ip": "198.51.100.7" })), "198.51.100.7");
assert.equal(
  getClientIp(headers({ "x-vercel-forwarded-for": "192.0.2.1" })),
  "192.0.2.1"
);
assert.equal(
  getClientIp(headers({ "cf-connecting-ip": "203.0.113.99" })),
  "203.0.113.99"
);
assert.equal(getClientIp(headers({})), null);
assert.equal(
  getClientIp(
    headers({
      "x-forwarded-for": "  8.8.8.8  ",
      "x-real-ip": "1.1.1.1",
    })
  ),
  "8.8.8.8"
);
assert.equal(getClientIp(headers({ "x-forwarded-for": "::1" })), "127.0.0.1");
assert.equal(
  getClientIp(headers({ "x-forwarded-for": "2001:db8::1, 203.0.113.50" })),
  "203.0.113.50"
);

assert.equal(
  resolveClientIpv4(headers({ "x-forwarded-for": "::1" }), "49.36.10.20"),
  "49.36.10.20"
);
assert.equal(
  resolveClientIpv4(headers({ "x-forwarded-for": "203.0.113.10" }), "8.8.8.8"),
  "203.0.113.10"
);

assert.equal(sanitizeReportedIpv4("192.168.1.25"), "192.168.1.25");
assert.equal(sanitizeReportedIpv4("not-an-ip"), null);
assert.equal(sanitizeReportedIpv4("::1"), "127.0.0.1");

console.log("client-ip tests passed");
