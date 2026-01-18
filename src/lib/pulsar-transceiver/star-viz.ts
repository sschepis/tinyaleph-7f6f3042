import { Star } from "@/lib/pulsar-transceiver/star-catalog";

/**
 * Stars are physically very close compared to pulsars (pc vs kpc).
 * For visualization, we apply a uniform expansion factor so the local
 * star neighborhood is visible on the same scene.
 */
export const STAR_LAYER_SCALE = 80;

export function starToVizPositionTuple(star: Star): [number, number, number] {
  // Import lazily to avoid circular deps during type loading.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { starEquatorialToGalactic } = require("@/lib/pulsar-transceiver/star-catalog") as typeof import("@/lib/pulsar-transceiver/star-catalog");

  const g = starEquatorialToGalactic(star.ra, star.dec, star.distance);
  const s = STAR_LAYER_SCALE;

  // Match pulsar axis convention: [x, z*10, y]
  return [g.x * 2 * s, g.z * 10 * s, g.y * 2 * s];
}
