/**
 * Real Star Catalog - Nearby and notable stars for 3D visualization
 * All data from astronomical catalogs (Hipparcos, Gaia)
 */

export interface Star {
  name: string;
  commonName?: string;
  ra: number;           // Right ascension (radians)
  dec: number;          // Declination (radians)
  distance: number;     // Distance (parsecs)
  magnitude: number;    // Apparent magnitude
  spectralType: string; // Spectral classification
  luminosity: number;   // Solar luminosities
  color: string;        // Hex color for visualization
}

// Convert HMS to radians
function hmsToRad(h: number, m: number, s: number): number {
  return ((h + m / 60 + s / 3600) / 24) * 2 * Math.PI;
}

// Convert DMS to radians
function dmsToRad(d: number, m: number, s: number): number {
  const sign = d >= 0 ? 1 : -1;
  return sign * ((Math.abs(d) + m / 60 + s / 3600) * Math.PI) / 180;
}

// Nearby stars (within ~50 parsecs)
export const NEARBY_STARS: Star[] = [
  // The Sun's neighborhood
  {
    name: 'α Centauri A',
    commonName: 'Rigil Kentaurus',
    ra: hmsToRad(14, 39, 36.5),
    dec: dmsToRad(-60, 50, 2.3),
    distance: 1.34,
    magnitude: -0.01,
    spectralType: 'G2V',
    luminosity: 1.519,
    color: '#fff4e8'
  },
  {
    name: 'α Centauri B',
    ra: hmsToRad(14, 39, 35.1),
    dec: dmsToRad(-60, 50, 13.8),
    distance: 1.34,
    magnitude: 1.33,
    spectralType: 'K1V',
    luminosity: 0.5,
    color: '#ffd2a1'
  },
  {
    name: 'Proxima Centauri',
    ra: hmsToRad(14, 29, 43.0),
    dec: dmsToRad(-62, 40, 46.1),
    distance: 1.30,
    magnitude: 11.13,
    spectralType: 'M5.5Ve',
    luminosity: 0.0017,
    color: '#ffcc6f'
  },
  {
    name: "Barnard's Star",
    ra: hmsToRad(17, 57, 48.5),
    dec: dmsToRad(4, 41, 36.2),
    distance: 1.83,
    magnitude: 9.54,
    spectralType: 'M4Ve',
    luminosity: 0.0035,
    color: '#ffcc6f'
  },
  {
    name: 'Sirius A',
    commonName: 'Dog Star',
    ra: hmsToRad(6, 45, 8.9),
    dec: dmsToRad(-16, 42, 58.0),
    distance: 2.64,
    magnitude: -1.46,
    spectralType: 'A1V',
    luminosity: 25.4,
    color: '#cad7ff'
  },
  {
    name: 'Sirius B',
    ra: hmsToRad(6, 45, 9.0),
    dec: dmsToRad(-16, 43, 6.0),
    distance: 2.64,
    magnitude: 8.44,
    spectralType: 'DA2',
    luminosity: 0.026,
    color: '#ffffff'
  },
  {
    name: 'Epsilon Eridani',
    ra: hmsToRad(3, 32, 55.8),
    dec: dmsToRad(-9, 27, 29.7),
    distance: 3.22,
    magnitude: 3.73,
    spectralType: 'K2V',
    luminosity: 0.34,
    color: '#ffd2a1'
  },
  {
    name: 'Procyon A',
    ra: hmsToRad(7, 39, 18.1),
    dec: dmsToRad(5, 13, 30.0),
    distance: 3.50,
    magnitude: 0.34,
    spectralType: 'F5IV-V',
    luminosity: 6.93,
    color: '#f8f7ff'
  },
  {
    name: '61 Cygni A',
    ra: hmsToRad(21, 6, 53.9),
    dec: dmsToRad(38, 44, 57.9),
    distance: 3.48,
    magnitude: 5.21,
    spectralType: 'K5V',
    luminosity: 0.15,
    color: '#ffc56c'
  },
  {
    name: 'Tau Ceti',
    ra: hmsToRad(1, 44, 4.1),
    dec: dmsToRad(-15, 56, 14.9),
    distance: 3.65,
    magnitude: 3.50,
    spectralType: 'G8.5V',
    luminosity: 0.52,
    color: '#fff4e8'
  },
  {
    name: 'Epsilon Indi A',
    ra: hmsToRad(22, 3, 21.7),
    dec: dmsToRad(-56, 47, 9.5),
    distance: 3.62,
    magnitude: 4.69,
    spectralType: 'K5V',
    luminosity: 0.22,
    color: '#ffc56c'
  },
  {
    name: 'Lacaille 9352',
    ra: hmsToRad(23, 5, 52.0),
    dec: dmsToRad(-35, 51, 11.0),
    distance: 3.29,
    magnitude: 7.34,
    spectralType: 'M1.5V',
    luminosity: 0.033,
    color: '#ffc56c'
  },
  {
    name: 'Luyten 726-8 A',
    commonName: 'UV Ceti',
    ra: hmsToRad(1, 39, 1.3),
    dec: dmsToRad(-17, 57, 1.8),
    distance: 2.68,
    magnitude: 12.54,
    spectralType: 'M5.5Ve',
    luminosity: 0.00006,
    color: '#ffcc6f'
  },
  {
    name: 'Ross 154',
    ra: hmsToRad(18, 49, 49.4),
    dec: dmsToRad(-23, 50, 10.4),
    distance: 2.97,
    magnitude: 10.44,
    spectralType: 'M3.5Ve',
    luminosity: 0.0038,
    color: '#ffcc6f'
  },
  {
    name: 'Wolf 359',
    ra: hmsToRad(10, 56, 29.2),
    dec: dmsToRad(7, 0, 52.8),
    distance: 2.39,
    magnitude: 13.54,
    spectralType: 'M6.5Ve',
    luminosity: 0.0014,
    color: '#ffcc6f'
  },
  {
    name: 'Lalande 21185',
    ra: hmsToRad(11, 3, 20.2),
    dec: dmsToRad(35, 58, 11.5),
    distance: 2.55,
    magnitude: 7.47,
    spectralType: 'M2V',
    luminosity: 0.021,
    color: '#ffc56c'
  },
  {
    name: 'Ross 248',
    ra: hmsToRad(23, 41, 54.7),
    dec: dmsToRad(44, 10, 30.3),
    distance: 3.16,
    magnitude: 12.29,
    spectralType: 'M5.5V',
    luminosity: 0.0018,
    color: '#ffcc6f'
  },
  {
    name: 'Groombridge 34 A',
    ra: hmsToRad(0, 18, 22.9),
    dec: dmsToRad(44, 1, 22.6),
    distance: 3.56,
    magnitude: 8.08,
    spectralType: 'M1.5V',
    luminosity: 0.0064,
    color: '#ffc56c'
  }
];

// Notable bright stars for reference
export const BRIGHT_STARS: Star[] = [
  {
    name: 'Vega',
    commonName: 'α Lyrae',
    ra: hmsToRad(18, 36, 56.3),
    dec: dmsToRad(38, 47, 1.3),
    distance: 7.68,
    magnitude: 0.03,
    spectralType: 'A0V',
    luminosity: 40.12,
    color: '#cad7ff'
  },
  {
    name: 'Arcturus',
    commonName: 'α Boötis',
    ra: hmsToRad(14, 15, 39.7),
    dec: dmsToRad(19, 10, 56.7),
    distance: 11.26,
    magnitude: -0.05,
    spectralType: 'K1.5III',
    luminosity: 170,
    color: '#ffcc6f'
  },
  {
    name: 'Capella',
    commonName: 'α Aurigae',
    ra: hmsToRad(5, 16, 41.4),
    dec: dmsToRad(45, 59, 52.8),
    distance: 12.94,
    magnitude: 0.08,
    spectralType: 'G3III',
    luminosity: 78.7,
    color: '#fff4e8'
  },
  {
    name: 'Rigel',
    commonName: 'β Orionis',
    ra: hmsToRad(5, 14, 32.3),
    dec: dmsToRad(-8, 12, 5.9),
    distance: 264,
    magnitude: 0.13,
    spectralType: 'B8Ia',
    luminosity: 120000,
    color: '#aabfff'
  },
  {
    name: 'Betelgeuse',
    commonName: 'α Orionis',
    ra: hmsToRad(5, 55, 10.3),
    dec: dmsToRad(7, 24, 25.4),
    distance: 222,
    magnitude: 0.42,
    spectralType: 'M1-2Ia-ab',
    luminosity: 126000,
    color: '#ff8c42'
  },
  {
    name: 'Altair',
    commonName: 'α Aquilae',
    ra: hmsToRad(19, 50, 47.0),
    dec: dmsToRad(8, 52, 5.9),
    distance: 5.13,
    magnitude: 0.76,
    spectralType: 'A7V',
    luminosity: 10.6,
    color: '#f8f7ff'
  },
  {
    name: 'Aldebaran',
    commonName: 'α Tauri',
    ra: hmsToRad(4, 35, 55.2),
    dec: dmsToRad(16, 30, 33.5),
    distance: 20.0,
    magnitude: 0.85,
    spectralType: 'K5III',
    luminosity: 518,
    color: '#ffc56c'
  },
  {
    name: 'Spica',
    commonName: 'α Virginis',
    ra: hmsToRad(13, 25, 11.6),
    dec: dmsToRad(-11, 9, 40.8),
    distance: 77.0,
    magnitude: 0.97,
    spectralType: 'B1V',
    luminosity: 12100,
    color: '#aabfff'
  },
  {
    name: 'Antares',
    commonName: 'α Scorpii',
    ra: hmsToRad(16, 29, 24.5),
    dec: dmsToRad(-26, 25, 55.2),
    distance: 170,
    magnitude: 1.06,
    spectralType: 'M1.5Iab-b',
    luminosity: 75900,
    color: '#ff8c42'
  },
  {
    name: 'Pollux',
    commonName: 'β Geminorum',
    ra: hmsToRad(7, 45, 18.9),
    dec: dmsToRad(28, 1, 34.3),
    distance: 10.36,
    magnitude: 1.14,
    spectralType: 'K0III',
    luminosity: 32.7,
    color: '#ffd2a1'
  },
  {
    name: 'Fomalhaut',
    commonName: 'α Piscis Austrini',
    ra: hmsToRad(22, 57, 39.0),
    dec: dmsToRad(-29, 37, 20.1),
    distance: 7.70,
    magnitude: 1.16,
    spectralType: 'A3V',
    luminosity: 16.63,
    color: '#f8f7ff'
  },
  {
    name: 'Deneb',
    commonName: 'α Cygni',
    ra: hmsToRad(20, 41, 25.9),
    dec: dmsToRad(45, 16, 49.2),
    distance: 802,
    magnitude: 1.25,
    spectralType: 'A2Ia',
    luminosity: 196000,
    color: '#f8f7ff'
  },
  {
    name: 'Regulus',
    commonName: 'α Leonis',
    ra: hmsToRad(10, 8, 22.3),
    dec: dmsToRad(11, 58, 1.9),
    distance: 24.3,
    magnitude: 1.35,
    spectralType: 'B7V',
    luminosity: 288,
    color: '#aabfff'
  },
  {
    name: 'Castor',
    commonName: 'α Geminorum',
    ra: hmsToRad(7, 34, 36.0),
    dec: dmsToRad(31, 53, 17.8),
    distance: 15.8,
    magnitude: 1.58,
    spectralType: 'A1V',
    luminosity: 52.4,
    color: '#f8f7ff'
  },
  {
    name: 'Polaris',
    commonName: 'α Ursae Minoris',
    ra: hmsToRad(2, 31, 49.1),
    dec: dmsToRad(89, 15, 50.8),
    distance: 132,
    magnitude: 1.98,
    spectralType: 'F7Ib',
    luminosity: 1260,
    color: '#fff4e8'
  }
];

// Combine all stars
export const ALL_STARS: Star[] = [...NEARBY_STARS, ...BRIGHT_STARS];

// Get stars within a certain distance (parsecs)
export function getStarsWithinDistance(maxDistance: number): Star[] {
  return ALL_STARS.filter(star => star.distance <= maxDistance);
}

// Convert equatorial to galactic coordinates for stars
export function starEquatorialToGalactic(ra: number, dec: number, distance: number): {
  x: number;
  y: number;
  z: number;
} {
  // North Galactic Pole: RA = 192.25°, Dec = 27.4°
  const l0 = 1.681; // RA of ascending node
  const d0 = 0.478; // Dec of NGP
  
  const sinB = Math.sin(dec) * Math.sin(d0) + 
               Math.cos(dec) * Math.cos(d0) * Math.cos(ra - l0);
  const b = Math.asin(sinB);
  
  const cosL = (Math.sin(dec) - sinB * Math.sin(d0)) / 
               (Math.cos(b) * Math.cos(d0));
  const sinL = Math.cos(dec) * Math.sin(ra - l0) / Math.cos(b);
  const l = Math.atan2(sinL, cosL) + Math.PI / 3;
  
  const distKpc = distance / 1000;
  return {
    x: distKpc * Math.cos(b) * Math.cos(l),
    y: distKpc * Math.cos(b) * Math.sin(l),
    z: distKpc * Math.sin(b)
  };
}
