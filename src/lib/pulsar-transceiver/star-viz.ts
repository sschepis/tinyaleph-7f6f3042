import { Star, starEquatorialToGalactic } from "@/lib/pulsar-transceiver/star-catalog";
import { 
  heliocentricToGalactocentric, 
  SUN_GALACTOCENTRIC_POSITION 
} from "@/lib/pulsar-transceiver/galactic-coordinates";

/**
 * Stars are physically very close compared to pulsars (pc vs kpc).
 * For visualization, we apply a uniform expansion factor so the local
 * star neighborhood is visible on the same scene.
 */
export const STAR_LAYER_SCALE = 80;

/**
 * Visualization scale factor (1 unit = 0.5 kpc in viz space)
 */
export const VIZ_SCALE = 2;

/**
 * Convert a star to galactocentric visualization coordinates
 * Stars are converted from heliocentric to galactocentric and scaled
 */
export function starToVizPositionTuple(star: Star): [number, number, number] {
  // Get heliocentric galactic coordinates (in kpc)
  const helio = starEquatorialToGalactic(star.ra, star.dec, star.distance);
  
  // Convert to galactocentric
  const galacto = heliocentricToGalactocentric(helio);
  
  const s = STAR_LAYER_SCALE;

  // Match pulsar axis convention: [x * scale, z * 10, y * scale]
  // Note: stars are close so we use STAR_LAYER_SCALE for expansion
  return [galacto.x * VIZ_SCALE * s, galacto.z * 10 * s, galacto.y * VIZ_SCALE * s];
}

/**
 * Get the Sun's position in visualization coordinates
 */
export function getSunVizPosition(): [number, number, number] {
  const s = SUN_GALACTOCENTRIC_POSITION;
  return [s.x * VIZ_SCALE, s.z * 10, s.y * VIZ_SCALE];
}
