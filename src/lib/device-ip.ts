import {
  isLoopbackOrPrivateIpv4,
  isIpv4,
  normalizeIp,
  pickBestDeviceIpv4,
} from "@/lib/client-ip";

function addIpv4(bucket: Set<string>, value: string | null | undefined) {
  if (!value) return;
  const ip = normalizeIp(value);
  if (isIpv4(ip) && ip !== "0.0.0.0") {
    bucket.add(ip);
  }
}

function collectFromSdp(sdp: string | undefined, bucket: Set<string>) {
  if (!sdp) return;
  for (const line of sdp.split(/\r?\n/)) {
    if (line.startsWith("c=IN IP4 ")) {
      addIpv4(bucket, line.slice("c=IN IP4 ".length).trim());
    }
    const candidateMatch = line.match(
      /a=candidate:.*? (\d{1,3}(?:\.\d{1,3}){3}) /
    );
    if (candidateMatch?.[1]) addIpv4(bucket, candidateMatch[1]);
  }
}

async function collectFromStats(
  pc: RTCPeerConnection,
  bucket: Set<string>
) {
  try {
    const stats = await pc.getStats();
    stats.forEach((report) => {
      const row = report as RTCStats & {
        type?: string;
        candidateType?: string;
        address?: string;
        ip?: string;
        ipAddress?: string;
      };
      if (row.type !== "local-candidate") return;
      if (row.candidateType && row.candidateType !== "host") return;
      addIpv4(bucket, row.address ?? row.ip ?? row.ipAddress);
    });
  } catch {
    /* ignore */
  }
}

/**
 * Discover the device LAN / Wi‑Fi IPv4 via WebRTC (ICE + SDP + getStats).
 * Chrome may hide LAN IPs behind mDNS — then this returns null and the
 * API falls back to the connection IP.
 */
export async function fetchDeviceIpv4(): Promise<string | null> {
  if (typeof window === "undefined" || !window.RTCPeerConnection) {
    return null;
  }

  const found = new Set<string>();

  return new Promise((resolve) => {
    let settled = false;

    const finish = async () => {
      if (settled) return;
      settled = true;
      await collectFromStats(pc, found);
      collectFromSdp(pc.localDescription?.sdp, found);
      try {
        pc.close();
      } catch {
        /* ignore */
      }
      resolve(pickBestDeviceIpv4([...found]));
    };

    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("device-ip");

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        void finish();
        return;
      }

      const { candidate, address, type } = event.candidate;

      if (type && type !== "host") return;

      if (address && !address.endsWith(".local")) {
        addIpv4(found, address);
      }

      const match = candidate.match(
        /(?:^| )(\d{1,3}(?:\.\d{1,3}){3})(?: |$)/
      );
      if (match?.[1]) addIpv4(found, match[1]);

      const best = pickBestDeviceIpv4([...found]);
      if (best && isLoopbackOrPrivateIpv4(best) && !best.startsWith("127.")) {
        void finish();
      }
    };

    pc.createOffer({ offerToReceiveAudio: true } as RTCOfferOptions)
      .then(async (offer) => {
        await pc.setLocalDescription(offer);
        collectFromSdp(pc.localDescription?.sdp, found);
        await collectFromStats(pc, found);
      })
      .catch(() => {
        void finish();
      });

    window.setTimeout(() => {
      void finish();
    }, 4000);
  });
}
