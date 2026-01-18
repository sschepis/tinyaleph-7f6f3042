/**
 * Milky Way Spiral Arm Definitions
 * Based on observational data from Gaia, VERA, and radio surveys
 * Uses logarithmic spiral model: r = a * e^(b * theta)
 */

export interface SpiralArm {
  name: string;
  color: string;
  /** Starting angle from the galactic center (radians) */
  startAngle: number;
  /** Pitch angle of the spiral (degrees) */
  pitchAngle: number;
  /** Inner radius (kpc from galactic center) */
  innerRadius: number;
  /** Outer radius (kpc from galactic center) */
  outerRadius: number;
  /** Width of the arm (kpc) */
  width: number;
  /** Opacity of the arm visualization */
  opacity: number;
}

/**
 * Major spiral arms of the Milky Way
 * Based on Reid et al. (2019) and subsequent Gaia refinements
 */
export const SPIRAL_ARMS: SpiralArm[] = [
  {
    name: 'Perseus Arm',
    color: '#3b82f6', // blue
    startAngle: -0.5, // radians
    pitchAngle: 12.5,
    innerRadius: 5,
    outerRadius: 14,
    width: 0.6,
    opacity: 0.25
  },
  {
    name: 'Orion–Cygnus Spur',
    color: '#22c55e', // green (where the Sun resides)
    startAngle: 0.2,
    pitchAngle: 12,
    innerRadius: 6.5,
    outerRadius: 9.5,
    width: 0.4,
    opacity: 0.35 // slightly brighter to highlight Sun's arm
  },
  {
    name: 'Sagittarius Arm',
    color: '#f59e0b', // amber
    startAngle: 0.9,
    pitchAngle: 11.5,
    innerRadius: 4,
    outerRadius: 11,
    width: 0.6,
    opacity: 0.25
  },
  {
    name: 'Scutum–Centaurus Arm',
    color: '#ef4444', // red
    startAngle: 2.2,
    pitchAngle: 13,
    innerRadius: 3,
    outerRadius: 12,
    width: 0.7,
    opacity: 0.25
  },
  {
    name: 'Norma Arm',
    color: '#a855f7', // purple
    startAngle: 3.8,
    pitchAngle: 12,
    innerRadius: 3,
    outerRadius: 8,
    width: 0.5,
    opacity: 0.2
  }
];

/**
 * Generate points along a logarithmic spiral arm
 * Returns array of [x, y] coordinates in kpc from galactic center
 */
export function generateSpiralPoints(
  arm: SpiralArm,
  segments: number = 120
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  
  // Logarithmic spiral: r = a * e^(b * theta)
  // where b = 1 / tan(pitchAngle)
  const pitchRad = (arm.pitchAngle * Math.PI) / 180;
  const b = 1 / Math.tan(pitchRad);
  
  // Calculate 'a' from the starting conditions
  // At theta = startAngle, r = innerRadius
  const a = arm.innerRadius / Math.exp(b * arm.startAngle);
  
  // Calculate angle range
  const thetaInner = arm.startAngle;
  const thetaOuter = Math.log(arm.outerRadius / a) / b;
  
  const deltaTheta = (thetaOuter - thetaInner) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const theta = thetaInner + i * deltaTheta;
    const r = a * Math.exp(b * theta);
    
    // Convert to Cartesian (galactocentric)
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    
    points.push([x, y]);
  }
  
  return points;
}

/**
 * Generate width offset points for creating a band shape
 * Returns inner and outer edge points
 */
export function generateSpiralBandPoints(
  arm: SpiralArm,
  segments: number = 120
): { inner: Array<[number, number]>; outer: Array<[number, number]> } {
  const centerPoints = generateSpiralPoints(arm, segments);
  const inner: Array<[number, number]> = [];
  const outer: Array<[number, number]> = [];
  
  for (let i = 0; i < centerPoints.length; i++) {
    const [x, y] = centerPoints[i];
    
    // Calculate normal direction (perpendicular to radial)
    const r = Math.sqrt(x * x + y * y);
    const nx = -y / r;
    const ny = x / r;
    
    const halfWidth = arm.width / 2;
    
    inner.push([x - nx * halfWidth, y - ny * halfWidth]);
    outer.push([x + nx * halfWidth, y + ny * halfWidth]);
  }
  
  return { inner, outer };
}
