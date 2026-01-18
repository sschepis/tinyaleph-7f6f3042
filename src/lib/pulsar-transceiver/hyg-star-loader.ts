import { Star } from "@/lib/pulsar-transceiver/star-catalog";

type LoadHipparcosOptions = {
  maxStars?: number;
  maxMagnitude?: number;
  maxDistancePc?: number;
};

const HYG_V3_CSV_URL =
  "https://raw.githubusercontent.com/astronexus/HYG-Database/master/hygdata_v3.csv";

function spectralToColor(spectral: string): string {
  const type = (spectral || "").charAt(0).toUpperCase();
  switch (type) {
    case "O":
      return "#9bb0ff";
    case "B":
      return "#aabfff";
    case "A":
      return "#cad7ff";
    case "F":
      return "#f8f7ff";
    case "G":
      return "#fff4e8";
    case "K":
      return "#ffd2a1";
    case "M":
      return "#ffcc6f";
    case "D":
      return "#ffffff";
    default:
      return "#ffffff";
  }
}

function safeNum(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function computeLuminosityFromAbsMag(absMag: number): number {
  // Approx using Sun absolute magnitude ~4.83
  return Math.pow(10, (4.83 - absMag) / 2.5);
}

export async function loadHipparcosStars(
  opts: LoadHipparcosOptions = {}
): Promise<Star[]> {
  const maxStars = opts.maxStars ?? 2500;
  const maxMagnitude = opts.maxMagnitude ?? 7.0;
  const maxDistancePc = opts.maxDistancePc ?? 300;

  const cacheKey = `hyg_v3_hip_${maxStars}_${maxMagnitude}_${maxDistancePc}`;

  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Star[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        // ignore cache parse errors
      }
    }
  }

  const res = await fetch(HYG_V3_CSV_URL);
  if (!res.ok) throw new Error(`Failed to load star catalog: ${res.status}`);

  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const header = lines[0]?.split(",") ?? [];

  const idx = (name: string) => header.indexOf(name);
  const iHip = idx("hip");
  const iProper = idx("proper");
  const iCon = idx("con");
  const iRaRad = idx("rarad");
  const iDecRad = idx("decrad");
  const iDist = idx("dist");
  const iMag = idx("mag");
  const iAbsMag = idx("absmag");
  const iSpect = idx("spect");
  const iLum = idx("lum");

  const stars: Star[] = [];

  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line) continue;

    const cols = line.split(",");
    const hipRaw = cols[iHip];
    const hip = hipRaw ? parseInt(hipRaw, 10) : NaN;
    if (!Number.isFinite(hip) || hip <= 0) continue;

    const mag = safeNum(cols[iMag]);
    if (mag === null || mag > maxMagnitude) continue;

    const dist = safeNum(cols[iDist]);
    if (dist === null || dist <= 0 || dist > maxDistancePc) continue;

    const ra = safeNum(cols[iRaRad]);
    const dec = safeNum(cols[iDecRad]);
    if (ra === null || dec === null) continue;

    const proper = (cols[iProper] || "").trim();
    const con = (cols[iCon] || "").trim();
    const spect = (cols[iSpect] || "").trim() || "G";

    const lumDirect = safeNum(cols[iLum]);
    const absMag = safeNum(cols[iAbsMag]);
    const lum =
      lumDirect && lumDirect > 0
        ? lumDirect
        : absMag !== null
          ? computeLuminosityFromAbsMag(absMag)
          : 1;

    const name = proper || `HIP ${hip}`;

    stars.push({
      name,
      commonName: proper || undefined,
      ra,
      dec,
      distance: dist,
      magnitude: mag,
      spectralType: spect,
      luminosity: lum,
      color: spectralToColor(spect),
      hip,
      constellation: con || undefined,
    });
  }

  stars.sort((a, b) => a.magnitude - b.magnitude || a.distance - b.distance);
  const sliced = stars.slice(0, maxStars);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify(sliced));
    } catch {
      // ignore cache write errors
    }
  }

  return sliced;
}
