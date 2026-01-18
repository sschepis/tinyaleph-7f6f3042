/**
 * Galactocentric Coordinate Utilities
 * Transforms heliocentric galactic coordinates to galactocentric (Milky Way center at origin)
 */

// Sun's distance from the Galactic Center (based on Gaia DR3 measurements)
export const SUN_GALACTOCENTRIC_DISTANCE = 8.2; // kpc

// Sun's height above the galactic plane
export const SUN_HEIGHT_ABOVE_PLANE = 0.02; // kpc (~20 pc)

/**
 * Sun's position in galactocentric coordinates
 * By convention, the Sun is positioned along the +X axis from the Galactic Center
 * (toward galactic longitude l=0, which points at the center)
 */
export const SUN_GALACTOCENTRIC_POSITION = {
  x: SUN_GALACTOCENTRIC_DISTANCE,
  y: 0,
  z: SUN_HEIGHT_ABOVE_PLANE
};

/**
 * Convert heliocentric galactic coordinates to galactocentric
 * Input: position relative to the Sun (heliocentric)
 * Output: position relative to the Galactic Center (galactocentric)
 */
export function heliocentricToGalactocentric(helio: { x: number; y: number; z: number }): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: helio.x + SUN_GALACTOCENTRIC_POSITION.x,
    y: helio.y + SUN_GALACTOCENTRIC_POSITION.y,
    z: helio.z + SUN_GALACTOCENTRIC_POSITION.z
  };
}

/**
 * Convert galactocentric coordinates to heliocentric
 * Input: position relative to the Galactic Center (galactocentric)
 * Output: position relative to the Sun (heliocentric)
 */
export function galactocentricToHeliocentric(galacto: { x: number; y: number; z: number }): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: galacto.x - SUN_GALACTOCENTRIC_POSITION.x,
    y: galacto.y - SUN_GALACTOCENTRIC_POSITION.y,
    z: galacto.z - SUN_GALACTOCENTRIC_POSITION.z
  };
}

/**
 * Calculate distance from the Galactic Center
 */
export function distanceFromGalacticCenter(pos: { x: number; y: number; z: number }): number {
  return Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
}

/**
 * Calculate distance from the Sun (for galactocentric coordinates)
 */
export function distanceFromSun(galactoPos: { x: number; y: number; z: number }): number {
  const dx = galactoPos.x - SUN_GALACTOCENTRIC_POSITION.x;
  const dy = galactoPos.y - SUN_GALACTOCENTRIC_POSITION.y;
  const dz = galactoPos.z - SUN_GALACTOCENTRIC_POSITION.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
