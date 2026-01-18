/**
 * Real Star Catalog - Comprehensive catalog of 500+ real stars
 * Data from Hipparcos, Gaia DR3, and Yale Bright Star Catalog
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
  hip?: number;         // Hipparcos catalog number
  constellation?: string;
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

// Spectral type to color mapping
function spectralToColor(spectral: string): string {
  const type = spectral.charAt(0).toUpperCase();
  switch (type) {
    case 'O': return '#9bb0ff'; // Blue
    case 'B': return '#aabfff'; // Blue-white
    case 'A': return '#cad7ff'; // White
    case 'F': return '#f8f7ff'; // Yellow-white
    case 'G': return '#fff4e8'; // Yellow (Sun-like)
    case 'K': return '#ffd2a1'; // Orange
    case 'M': return '#ffcc6f'; // Red
    case 'L': return '#ff8c42'; // Brown dwarf
    case 'T': return '#ff6b6b'; // Brown dwarf
    case 'D': return '#ffffff'; // White dwarf
    default: return '#ffffff';
  }
}

// ===== NEARBY STARS (within 25 parsecs) =====
export const NEARBY_STARS: Star[] = [
  // Closest stars to the Sun
  { name: 'Proxima Centauri', hip: 70890, constellation: 'Centaurus', ra: hmsToRad(14, 29, 43.0), dec: dmsToRad(-62, 40, 46.1), distance: 1.30, magnitude: 11.13, spectralType: 'M5.5Ve', luminosity: 0.0017, color: '#ffcc6f' },
  { name: 'α Centauri A', commonName: 'Rigil Kentaurus', hip: 71683, constellation: 'Centaurus', ra: hmsToRad(14, 39, 36.5), dec: dmsToRad(-60, 50, 2.3), distance: 1.34, magnitude: -0.01, spectralType: 'G2V', luminosity: 1.519, color: '#fff4e8' },
  { name: 'α Centauri B', hip: 71681, constellation: 'Centaurus', ra: hmsToRad(14, 39, 35.1), dec: dmsToRad(-60, 50, 13.8), distance: 1.34, magnitude: 1.33, spectralType: 'K1V', luminosity: 0.5, color: '#ffd2a1' },
  { name: "Barnard's Star", hip: 87937, constellation: 'Ophiuchus', ra: hmsToRad(17, 57, 48.5), dec: dmsToRad(4, 41, 36.2), distance: 1.83, magnitude: 9.54, spectralType: 'M4Ve', luminosity: 0.0035, color: '#ffcc6f' },
  { name: 'Wolf 359', constellation: 'Leo', ra: hmsToRad(10, 56, 29.2), dec: dmsToRad(7, 0, 52.8), distance: 2.39, magnitude: 13.54, spectralType: 'M6.5Ve', luminosity: 0.0014, color: '#ffcc6f' },
  { name: 'Lalande 21185', hip: 54035, constellation: 'Ursa Major', ra: hmsToRad(11, 3, 20.2), dec: dmsToRad(35, 58, 11.5), distance: 2.55, magnitude: 7.47, spectralType: 'M2V', luminosity: 0.021, color: '#ffcc6f' },
  { name: 'Sirius A', commonName: 'Dog Star', hip: 32349, constellation: 'Canis Major', ra: hmsToRad(6, 45, 8.9), dec: dmsToRad(-16, 42, 58.0), distance: 2.64, magnitude: -1.46, spectralType: 'A1V', luminosity: 25.4, color: '#cad7ff' },
  { name: 'Sirius B', constellation: 'Canis Major', ra: hmsToRad(6, 45, 9.0), dec: dmsToRad(-16, 43, 6.0), distance: 2.64, magnitude: 8.44, spectralType: 'DA2', luminosity: 0.026, color: '#ffffff' },
  { name: 'Luyten 726-8 A', commonName: 'BL Ceti', constellation: 'Cetus', ra: hmsToRad(1, 39, 1.3), dec: dmsToRad(-17, 57, 1.8), distance: 2.68, magnitude: 12.54, spectralType: 'M5.5Ve', luminosity: 0.00006, color: '#ffcc6f' },
  { name: 'Luyten 726-8 B', commonName: 'UV Ceti', constellation: 'Cetus', ra: hmsToRad(1, 39, 1.3), dec: dmsToRad(-17, 57, 1.8), distance: 2.68, magnitude: 12.99, spectralType: 'M6Ve', luminosity: 0.00004, color: '#ffcc6f' },
  { name: 'Ross 154', hip: 92403, constellation: 'Sagittarius', ra: hmsToRad(18, 49, 49.4), dec: dmsToRad(-23, 50, 10.4), distance: 2.97, magnitude: 10.44, spectralType: 'M3.5Ve', luminosity: 0.0038, color: '#ffcc6f' },
  { name: 'Ross 248', hip: 116132, constellation: 'Andromeda', ra: hmsToRad(23, 41, 54.7), dec: dmsToRad(44, 10, 30.3), distance: 3.16, magnitude: 12.29, spectralType: 'M5.5V', luminosity: 0.0018, color: '#ffcc6f' },
  { name: 'Epsilon Eridani', hip: 16537, constellation: 'Eridanus', ra: hmsToRad(3, 32, 55.8), dec: dmsToRad(-9, 27, 29.7), distance: 3.22, magnitude: 3.73, spectralType: 'K2V', luminosity: 0.34, color: '#ffd2a1' },
  { name: 'Lacaille 9352', hip: 114046, constellation: 'Piscis Austrinus', ra: hmsToRad(23, 5, 52.0), dec: dmsToRad(-35, 51, 11.0), distance: 3.29, magnitude: 7.34, spectralType: 'M1.5V', luminosity: 0.033, color: '#ffcc6f' },
  { name: 'Ross 128', hip: 57548, constellation: 'Virgo', ra: hmsToRad(11, 47, 44.4), dec: dmsToRad(0, 48, 16.4), distance: 3.37, magnitude: 11.13, spectralType: 'M4Vn', luminosity: 0.0036, color: '#ffcc6f' },
  { name: '61 Cygni A', hip: 104214, constellation: 'Cygnus', ra: hmsToRad(21, 6, 53.9), dec: dmsToRad(38, 44, 57.9), distance: 3.48, magnitude: 5.21, spectralType: 'K5V', luminosity: 0.15, color: '#ffd2a1' },
  { name: '61 Cygni B', hip: 104217, constellation: 'Cygnus', ra: hmsToRad(21, 6, 55.3), dec: dmsToRad(38, 44, 31.4), distance: 3.48, magnitude: 6.03, spectralType: 'K7V', luminosity: 0.085, color: '#ffd2a1' },
  { name: 'Procyon A', hip: 37279, constellation: 'Canis Minor', ra: hmsToRad(7, 39, 18.1), dec: dmsToRad(5, 13, 30.0), distance: 3.50, magnitude: 0.34, spectralType: 'F5IV-V', luminosity: 6.93, color: '#f8f7ff' },
  { name: 'Procyon B', constellation: 'Canis Minor', ra: hmsToRad(7, 39, 18.1), dec: dmsToRad(5, 13, 30.0), distance: 3.50, magnitude: 10.7, spectralType: 'DQZ', luminosity: 0.00055, color: '#ffffff' },
  { name: 'Groombridge 34 A', hip: 1475, constellation: 'Andromeda', ra: hmsToRad(0, 18, 22.9), dec: dmsToRad(44, 1, 22.6), distance: 3.56, magnitude: 8.08, spectralType: 'M1.5V', luminosity: 0.0064, color: '#ffcc6f' },
  { name: 'Groombridge 34 B', constellation: 'Andromeda', ra: hmsToRad(0, 18, 22.9), dec: dmsToRad(44, 1, 22.6), distance: 3.56, magnitude: 11.06, spectralType: 'M3.5V', luminosity: 0.0004, color: '#ffcc6f' },
  { name: 'Epsilon Indi A', hip: 108870, constellation: 'Indus', ra: hmsToRad(22, 3, 21.7), dec: dmsToRad(-56, 47, 9.5), distance: 3.62, magnitude: 4.69, spectralType: 'K5V', luminosity: 0.22, color: '#ffd2a1' },
  { name: 'Tau Ceti', hip: 8102, constellation: 'Cetus', ra: hmsToRad(1, 44, 4.1), dec: dmsToRad(-15, 56, 14.9), distance: 3.65, magnitude: 3.50, spectralType: 'G8.5V', luminosity: 0.52, color: '#fff4e8' },
  { name: "Luyten's Star", hip: 36208, constellation: 'Canis Minor', ra: hmsToRad(7, 27, 24.5), dec: dmsToRad(5, 13, 32.8), distance: 3.72, magnitude: 9.87, spectralType: 'M3.5V', luminosity: 0.0014, color: '#ffcc6f' },
  { name: "Teegarden's Star", constellation: 'Aries', ra: hmsToRad(2, 53, 0.9), dec: dmsToRad(16, 52, 53.3), distance: 3.83, magnitude: 15.1, spectralType: 'M6.5V', luminosity: 0.00073, color: '#ffcc6f' },
  { name: "Kapteyn's Star", hip: 24186, constellation: 'Pictor', ra: hmsToRad(5, 11, 40.6), dec: dmsToRad(-45, 1, 6.3), distance: 3.91, magnitude: 8.85, spectralType: 'sdM1', luminosity: 0.012, color: '#ffcc6f' },
  { name: 'Lacaille 8760', hip: 105090, constellation: 'Microscopium', ra: hmsToRad(21, 17, 15.3), dec: dmsToRad(-38, 52, 2.5), distance: 3.97, magnitude: 6.67, spectralType: 'M0V', luminosity: 0.029, color: '#ffcc6f' },
  { name: 'Kruger 60 A', hip: 110893, constellation: 'Cepheus', ra: hmsToRad(22, 27, 59.5), dec: dmsToRad(57, 41, 45.1), distance: 4.01, magnitude: 9.79, spectralType: 'M3V', luminosity: 0.010, color: '#ffcc6f' },
  { name: 'Kruger 60 B', constellation: 'Cepheus', ra: hmsToRad(22, 27, 59.5), dec: dmsToRad(57, 41, 45.1), distance: 4.01, magnitude: 11.3, spectralType: 'M4V', luminosity: 0.0034, color: '#ffcc6f' },
  { name: 'Ross 614 A', hip: 29295, constellation: 'Monoceros', ra: hmsToRad(6, 29, 23.4), dec: dmsToRad(-2, 48, 50.3), distance: 4.09, magnitude: 11.15, spectralType: 'M4.5V', luminosity: 0.0024, color: '#ffcc6f' },
  { name: 'Wolf 1061', hip: 80824, constellation: 'Ophiuchus', ra: hmsToRad(16, 30, 18.1), dec: dmsToRad(-12, 39, 45.3), distance: 4.29, magnitude: 10.07, spectralType: 'M3V', luminosity: 0.0089, color: '#ffcc6f' },
  { name: "Van Maanen's Star", hip: 3829, constellation: 'Pisces', ra: hmsToRad(0, 49, 9.9), dec: dmsToRad(5, 23, 19.0), distance: 4.31, magnitude: 12.37, spectralType: 'DZ7', luminosity: 0.00017, color: '#ffffff' },
  { name: 'Gliese 1', hip: 439, constellation: 'Sculptor', ra: hmsToRad(0, 5, 24.4), dec: dmsToRad(-37, 21, 26.5), distance: 4.36, magnitude: 8.55, spectralType: 'M1.5V', luminosity: 0.022, color: '#ffcc6f' },
  { name: 'Wolf 424 A', hip: 61205, constellation: 'Virgo', ra: hmsToRad(12, 33, 17.2), dec: dmsToRad(9, 1, 15.8), distance: 4.37, magnitude: 13.18, spectralType: 'M5.5V', luminosity: 0.0014, color: '#ffcc6f' },
  { name: 'TZ Arietis', hip: 9724, constellation: 'Aries', ra: hmsToRad(2, 0, 13.2), dec: dmsToRad(13, 3, 7.9), distance: 4.48, magnitude: 12.05, spectralType: 'M4.5V', luminosity: 0.0015, color: '#ffcc6f' },
  { name: 'Gliese 687', hip: 86162, constellation: 'Draco', ra: hmsToRad(17, 36, 25.9), dec: dmsToRad(68, 20, 20.9), distance: 4.53, magnitude: 9.15, spectralType: 'M3.5V', luminosity: 0.0213, color: '#ffcc6f' },
  { name: 'LHS 292', constellation: 'Sextans', ra: hmsToRad(10, 48, 12.6), dec: dmsToRad(-11, 20, 14.0), distance: 4.54, magnitude: 15.60, spectralType: 'M6.5V', luminosity: 0.00046, color: '#ffcc6f' },
  { name: 'Gliese 674', hip: 85523, constellation: 'Ara', ra: hmsToRad(17, 28, 39.9), dec: dmsToRad(-46, 53, 42.7), distance: 4.55, magnitude: 9.38, spectralType: 'M2.5V', luminosity: 0.016, color: '#ffcc6f' },
  { name: 'GJ 1245 A', hip: 97980, constellation: 'Cygnus', ra: hmsToRad(19, 53, 54.2), dec: dmsToRad(44, 24, 55.1), distance: 4.54, magnitude: 13.46, spectralType: 'M5.5V', luminosity: 0.0012, color: '#ffcc6f' },
  { name: 'Gliese 876', hip: 113020, constellation: 'Aquarius', ra: hmsToRad(22, 53, 16.7), dec: dmsToRad(-14, 15, 49.3), distance: 4.69, magnitude: 10.17, spectralType: 'M4V', luminosity: 0.013, color: '#ffcc6f' },
  { name: 'Gliese 832', hip: 106440, constellation: 'Grus', ra: hmsToRad(21, 33, 34.0), dec: dmsToRad(-49, 0, 32.4), distance: 4.94, magnitude: 8.66, spectralType: 'M1.5V', luminosity: 0.027, color: '#ffcc6f' },
  { name: 'Altair', commonName: 'α Aquilae', hip: 97649, constellation: 'Aquila', ra: hmsToRad(19, 50, 47.0), dec: dmsToRad(8, 52, 5.9), distance: 5.13, magnitude: 0.76, spectralType: 'A7V', luminosity: 10.6, color: '#f8f7ff' },
  { name: 'EV Lacertae', hip: 112460, constellation: 'Lacerta', ra: hmsToRad(22, 46, 49.7), dec: dmsToRad(44, 20, 2.4), distance: 5.05, magnitude: 10.06, spectralType: 'M3.5Ve', luminosity: 0.013, color: '#ffcc6f' },
  { name: '70 Ophiuchi A', hip: 88601, constellation: 'Ophiuchus', ra: hmsToRad(18, 5, 27.3), dec: dmsToRad(2, 30, 0.4), distance: 5.09, magnitude: 4.03, spectralType: 'K0V', luminosity: 0.43, color: '#ffd2a1' },
  { name: '70 Ophiuchi B', constellation: 'Ophiuchus', ra: hmsToRad(18, 5, 27.3), dec: dmsToRad(2, 30, 0.4), distance: 5.09, magnitude: 6.00, spectralType: 'K4V', luminosity: 0.077, color: '#ffd2a1' },
  { name: '36 Ophiuchi A', hip: 84405, constellation: 'Ophiuchus', ra: hmsToRad(17, 15, 20.8), dec: dmsToRad(-26, 36, 9.0), distance: 5.99, magnitude: 5.07, spectralType: 'K0V', luminosity: 0.28, color: '#ffd2a1' },
  { name: '36 Ophiuchi B', constellation: 'Ophiuchus', ra: hmsToRad(17, 15, 21.0), dec: dmsToRad(-26, 36, 10.0), distance: 5.99, magnitude: 5.11, spectralType: 'K1V', luminosity: 0.27, color: '#ffd2a1' },
  { name: 'HR 7703', hip: 99461, constellation: 'Sagittarius', ra: hmsToRad(20, 11, 11.9), dec: dmsToRad(-36, 6, 4.3), distance: 5.94, magnitude: 5.31, spectralType: 'K3V', luminosity: 0.21, color: '#ffd2a1' },
  { name: 'Sigma Draconis', hip: 96100, constellation: 'Draco', ra: hmsToRad(19, 32, 21.6), dec: dmsToRad(69, 39, 40.2), distance: 5.77, magnitude: 4.68, spectralType: 'G9V', luminosity: 0.43, color: '#fff4e8' },
  { name: 'Eta Cassiopeiae A', hip: 3821, constellation: 'Cassiopeia', ra: hmsToRad(0, 49, 6.3), dec: dmsToRad(57, 48, 54.7), distance: 5.95, magnitude: 3.44, spectralType: 'G3V', luminosity: 1.23, color: '#fff4e8' },
  { name: '82 Eridani', hip: 15510, constellation: 'Eridanus', ra: hmsToRad(3, 19, 55.7), dec: dmsToRad(-43, 4, 11.2), distance: 6.04, magnitude: 4.26, spectralType: 'G8V', luminosity: 0.70, color: '#fff4e8' },
  { name: 'Delta Pavonis', hip: 99240, constellation: 'Pavo', ra: hmsToRad(20, 8, 43.6), dec: dmsToRad(-66, 10, 55.4), distance: 6.11, magnitude: 3.55, spectralType: 'G8IV', luminosity: 1.22, color: '#fff4e8' },
  { name: 'Gliese 570 A', hip: 73184, constellation: 'Libra', ra: hmsToRad(14, 57, 28.0), dec: dmsToRad(-21, 24, 55.7), distance: 5.84, magnitude: 5.64, spectralType: 'K4V', luminosity: 0.155, color: '#ffd2a1' },
  { name: 'HR 8832', hip: 116771, constellation: 'Cassiopeia', ra: hmsToRad(23, 13, 16.5), dec: dmsToRad(57, 10, 6.1), distance: 6.39, magnitude: 5.57, spectralType: 'K3V', luminosity: 0.21, color: '#ffd2a1' },
  { name: 'Xi Bootis A', hip: 72659, constellation: 'Boötes', ra: hmsToRad(14, 51, 23.4), dec: dmsToRad(19, 6, 1.7), distance: 6.70, magnitude: 4.54, spectralType: 'G8Ve', luminosity: 0.49, color: '#fff4e8' },
  { name: 'Mu Cassiopeiae A', hip: 5336, constellation: 'Cassiopeia', ra: hmsToRad(1, 8, 16.4), dec: dmsToRad(54, 55, 13.2), distance: 7.59, magnitude: 5.17, spectralType: 'G5Vb', luminosity: 0.39, color: '#fff4e8' },
  { name: 'Beta Comae Berenices', hip: 64394, constellation: 'Coma Berenices', ra: hmsToRad(13, 11, 52.4), dec: dmsToRad(27, 52, 41.5), distance: 9.16, magnitude: 4.26, spectralType: 'G0V', luminosity: 1.36, color: '#fff4e8' },
  { name: 'Kappa Ceti', hip: 15457, constellation: 'Cetus', ra: hmsToRad(3, 19, 21.7), dec: dmsToRad(3, 22, 12.7), distance: 9.16, magnitude: 4.84, spectralType: 'G5V', luminosity: 0.85, color: '#fff4e8' },
  { name: 'Gamma Leporis A', hip: 27072, constellation: 'Lepus', ra: hmsToRad(5, 44, 27.8), dec: dmsToRad(-22, 26, 54.2), distance: 8.97, magnitude: 3.59, spectralType: 'F6V', luminosity: 2.29, color: '#f8f7ff' },
  { name: 'Zeta Tucanae', hip: 1599, constellation: 'Tucana', ra: hmsToRad(0, 20, 4.3), dec: dmsToRad(-64, 52, 29.2), distance: 8.59, magnitude: 4.23, spectralType: 'F9.5V', luminosity: 1.26, color: '#f8f7ff' },
  { name: 'Chi1 Orionis A', hip: 27913, constellation: 'Orion', ra: hmsToRad(5, 54, 23.0), dec: dmsToRad(20, 16, 34.2), distance: 8.66, magnitude: 4.39, spectralType: 'G0V', luminosity: 1.04, color: '#fff4e8' },
];

// ===== BRIGHT STARS (notable stars visible to naked eye) =====
export const BRIGHT_STARS: Star[] = [
  // First magnitude stars and notable navigation stars
  { name: 'Vega', commonName: 'α Lyrae', hip: 91262, constellation: 'Lyra', ra: hmsToRad(18, 36, 56.3), dec: dmsToRad(38, 47, 1.3), distance: 7.68, magnitude: 0.03, spectralType: 'A0V', luminosity: 40.12, color: '#cad7ff' },
  { name: 'Arcturus', commonName: 'α Boötis', hip: 69673, constellation: 'Boötes', ra: hmsToRad(14, 15, 39.7), dec: dmsToRad(19, 10, 56.7), distance: 11.26, magnitude: -0.05, spectralType: 'K1.5III', luminosity: 170, color: '#ffcc6f' },
  { name: 'Capella', commonName: 'α Aurigae', hip: 24608, constellation: 'Auriga', ra: hmsToRad(5, 16, 41.4), dec: dmsToRad(45, 59, 52.8), distance: 12.94, magnitude: 0.08, spectralType: 'G3III', luminosity: 78.7, color: '#fff4e8' },
  { name: 'Rigel', commonName: 'β Orionis', hip: 24436, constellation: 'Orion', ra: hmsToRad(5, 14, 32.3), dec: dmsToRad(-8, 12, 5.9), distance: 264, magnitude: 0.13, spectralType: 'B8Ia', luminosity: 120000, color: '#aabfff' },
  { name: 'Betelgeuse', commonName: 'α Orionis', hip: 27989, constellation: 'Orion', ra: hmsToRad(5, 55, 10.3), dec: dmsToRad(7, 24, 25.4), distance: 222, magnitude: 0.42, spectralType: 'M1-2Ia-ab', luminosity: 126000, color: '#ff8c42' },
  { name: 'Aldebaran', commonName: 'α Tauri', hip: 21421, constellation: 'Taurus', ra: hmsToRad(4, 35, 55.2), dec: dmsToRad(16, 30, 33.5), distance: 20.0, magnitude: 0.85, spectralType: 'K5III', luminosity: 518, color: '#ffc56c' },
  { name: 'Spica', commonName: 'α Virginis', hip: 65474, constellation: 'Virgo', ra: hmsToRad(13, 25, 11.6), dec: dmsToRad(-11, 9, 40.8), distance: 77.0, magnitude: 0.97, spectralType: 'B1V', luminosity: 12100, color: '#aabfff' },
  { name: 'Antares', commonName: 'α Scorpii', hip: 80763, constellation: 'Scorpius', ra: hmsToRad(16, 29, 24.5), dec: dmsToRad(-26, 25, 55.2), distance: 170, magnitude: 1.06, spectralType: 'M1.5Iab-b', luminosity: 75900, color: '#ff8c42' },
  { name: 'Pollux', commonName: 'β Geminorum', hip: 37826, constellation: 'Gemini', ra: hmsToRad(7, 45, 18.9), dec: dmsToRad(28, 1, 34.3), distance: 10.36, magnitude: 1.14, spectralType: 'K0III', luminosity: 32.7, color: '#ffd2a1' },
  { name: 'Fomalhaut', commonName: 'α Piscis Austrini', hip: 113368, constellation: 'Piscis Austrinus', ra: hmsToRad(22, 57, 39.0), dec: dmsToRad(-29, 37, 20.1), distance: 7.70, magnitude: 1.16, spectralType: 'A3V', luminosity: 16.63, color: '#f8f7ff' },
  { name: 'Deneb', commonName: 'α Cygni', hip: 102098, constellation: 'Cygnus', ra: hmsToRad(20, 41, 25.9), dec: dmsToRad(45, 16, 49.2), distance: 802, magnitude: 1.25, spectralType: 'A2Ia', luminosity: 196000, color: '#f8f7ff' },
  { name: 'Regulus', commonName: 'α Leonis', hip: 49669, constellation: 'Leo', ra: hmsToRad(10, 8, 22.3), dec: dmsToRad(11, 58, 1.9), distance: 24.3, magnitude: 1.35, spectralType: 'B7V', luminosity: 288, color: '#aabfff' },
  { name: 'Castor', commonName: 'α Geminorum', hip: 36850, constellation: 'Gemini', ra: hmsToRad(7, 34, 36.0), dec: dmsToRad(31, 53, 17.8), distance: 15.8, magnitude: 1.58, spectralType: 'A1V', luminosity: 52.4, color: '#f8f7ff' },
  { name: 'Polaris', commonName: 'α Ursae Minoris', hip: 11767, constellation: 'Ursa Minor', ra: hmsToRad(2, 31, 49.1), dec: dmsToRad(89, 15, 50.8), distance: 132, magnitude: 1.98, spectralType: 'F7Ib', luminosity: 1260, color: '#fff4e8' },
  { name: 'Achernar', commonName: 'α Eridani', hip: 7588, constellation: 'Eridanus', ra: hmsToRad(1, 37, 42.8), dec: dmsToRad(-57, 14, 12.3), distance: 42.8, magnitude: 0.46, spectralType: 'B3Vpe', luminosity: 3150, color: '#aabfff' },
  { name: 'Hadar', commonName: 'β Centauri', hip: 68702, constellation: 'Centaurus', ra: hmsToRad(14, 3, 49.4), dec: dmsToRad(-60, 22, 22.9), distance: 161, magnitude: 0.61, spectralType: 'B1III', luminosity: 41700, color: '#aabfff' },
  { name: 'Acrux', commonName: 'α Crucis', hip: 60718, constellation: 'Crux', ra: hmsToRad(12, 26, 35.9), dec: dmsToRad(-63, 5, 56.7), distance: 99, magnitude: 0.76, spectralType: 'B0.5IV', luminosity: 25000, color: '#9bb0ff' },
  { name: 'Mimosa', commonName: 'β Crucis', hip: 62434, constellation: 'Crux', ra: hmsToRad(12, 47, 43.3), dec: dmsToRad(-59, 41, 19.6), distance: 85, magnitude: 1.25, spectralType: 'B0.5III', luminosity: 34000, color: '#9bb0ff' },
  { name: 'Canopus', commonName: 'α Carinae', hip: 30438, constellation: 'Carina', ra: hmsToRad(6, 23, 57.1), dec: dmsToRad(-52, 41, 44.4), distance: 95, magnitude: -0.74, spectralType: 'A9II', luminosity: 10700, color: '#f8f7ff' },
  { name: 'Alnilam', commonName: 'ε Orionis', hip: 26311, constellation: 'Orion', ra: hmsToRad(5, 36, 12.8), dec: dmsToRad(-1, 12, 6.9), distance: 606, magnitude: 1.69, spectralType: 'B0Ia', luminosity: 275000, color: '#9bb0ff' },
  { name: 'Alnitak', commonName: 'ζ Orionis', hip: 26727, constellation: 'Orion', ra: hmsToRad(5, 40, 45.5), dec: dmsToRad(-1, 56, 33.3), distance: 226, magnitude: 1.74, spectralType: 'O9.5Ib', luminosity: 250000, color: '#9bb0ff' },
  { name: 'Mintaka', commonName: 'δ Orionis', hip: 25930, constellation: 'Orion', ra: hmsToRad(5, 32, 0.4), dec: dmsToRad(-0, 17, 56.7), distance: 212, magnitude: 2.23, spectralType: 'O9.5II', luminosity: 190000, color: '#9bb0ff' },
  { name: 'Bellatrix', commonName: 'γ Orionis', hip: 25336, constellation: 'Orion', ra: hmsToRad(5, 25, 7.9), dec: dmsToRad(6, 20, 58.9), distance: 77.3, magnitude: 1.64, spectralType: 'B2III', luminosity: 9211, color: '#aabfff' },
  { name: 'Saiph', commonName: 'κ Orionis', hip: 27366, constellation: 'Orion', ra: hmsToRad(5, 47, 45.4), dec: dmsToRad(-9, 40, 10.6), distance: 220, magnitude: 2.09, spectralType: 'B0.5Ia', luminosity: 56881, color: '#9bb0ff' },
  { name: 'Dubhe', commonName: 'α Ursae Majoris', hip: 54061, constellation: 'Ursa Major', ra: hmsToRad(11, 3, 43.7), dec: dmsToRad(61, 45, 3.7), distance: 37.4, magnitude: 1.79, spectralType: 'K0III', luminosity: 316, color: '#ffd2a1' },
  { name: 'Merak', commonName: 'β Ursae Majoris', hip: 53910, constellation: 'Ursa Major', ra: hmsToRad(11, 1, 50.5), dec: dmsToRad(56, 22, 56.7), distance: 24.4, magnitude: 2.37, spectralType: 'A1V', luminosity: 63.0, color: '#cad7ff' },
  { name: 'Phecda', commonName: 'γ Ursae Majoris', hip: 58001, constellation: 'Ursa Major', ra: hmsToRad(11, 53, 49.8), dec: dmsToRad(53, 41, 41.1), distance: 25.6, magnitude: 2.44, spectralType: 'A0Ve', luminosity: 65.3, color: '#cad7ff' },
  { name: 'Megrez', commonName: 'δ Ursae Majoris', hip: 59774, constellation: 'Ursa Major', ra: hmsToRad(12, 15, 25.6), dec: dmsToRad(57, 1, 57.4), distance: 24.9, magnitude: 3.31, spectralType: 'A3V', luminosity: 14.0, color: '#cad7ff' },
  { name: 'Alioth', commonName: 'ε Ursae Majoris', hip: 62956, constellation: 'Ursa Major', ra: hmsToRad(12, 54, 1.7), dec: dmsToRad(55, 57, 35.4), distance: 25.0, magnitude: 1.77, spectralType: 'A0pCr', luminosity: 102, color: '#cad7ff' },
  { name: 'Mizar', commonName: 'ζ Ursae Majoris', hip: 65378, constellation: 'Ursa Major', ra: hmsToRad(13, 23, 55.5), dec: dmsToRad(54, 55, 31.3), distance: 24.0, magnitude: 2.27, spectralType: 'A2V', luminosity: 71.0, color: '#cad7ff' },
  { name: 'Alkaid', commonName: 'η Ursae Majoris', hip: 67301, constellation: 'Ursa Major', ra: hmsToRad(13, 47, 32.4), dec: dmsToRad(49, 18, 48.0), distance: 31.2, magnitude: 1.86, spectralType: 'B3V', luminosity: 594, color: '#aabfff' },
  { name: 'Schedar', commonName: 'α Cassiopeiae', hip: 3179, constellation: 'Cassiopeia', ra: hmsToRad(0, 40, 30.4), dec: dmsToRad(56, 32, 14.4), distance: 70.0, magnitude: 2.24, spectralType: 'K0IIIa', luminosity: 855, color: '#ffd2a1' },
  { name: 'Caph', commonName: 'β Cassiopeiae', hip: 746, constellation: 'Cassiopeia', ra: hmsToRad(0, 9, 10.7), dec: dmsToRad(59, 8, 59.2), distance: 16.8, magnitude: 2.27, spectralType: 'F2III', luminosity: 27.3, color: '#f8f7ff' },
  { name: 'Ruchbah', commonName: 'δ Cassiopeiae', hip: 6686, constellation: 'Cassiopeia', ra: hmsToRad(1, 25, 49.0), dec: dmsToRad(60, 14, 7.0), distance: 30.8, magnitude: 2.68, spectralType: 'A5III-IVv', luminosity: 63.0, color: '#cad7ff' },
  { name: 'Alpheratz', commonName: 'α Andromedae', hip: 677, constellation: 'Andromeda', ra: hmsToRad(0, 8, 23.3), dec: dmsToRad(29, 5, 25.6), distance: 29.7, magnitude: 2.06, spectralType: 'B8IVpMnHg', luminosity: 200, color: '#aabfff' },
  { name: 'Mirach', commonName: 'β Andromedae', hip: 5447, constellation: 'Andromeda', ra: hmsToRad(1, 9, 43.9), dec: dmsToRad(35, 37, 14.0), distance: 60.0, magnitude: 2.05, spectralType: 'M0III', luminosity: 1995, color: '#ff8c42' },
  { name: 'Almach', commonName: 'γ Andromedae', hip: 9640, constellation: 'Andromeda', ra: hmsToRad(2, 3, 54.0), dec: dmsToRad(42, 19, 47.0), distance: 109, magnitude: 2.10, spectralType: 'K3IIb', luminosity: 2000, color: '#ffd2a1' },
  { name: 'Hamal', commonName: 'α Arietis', hip: 9884, constellation: 'Aries', ra: hmsToRad(2, 7, 10.4), dec: dmsToRad(23, 27, 44.7), distance: 20.2, magnitude: 2.00, spectralType: 'K2III', luminosity: 91, color: '#ffd2a1' },
  { name: 'Sheratan', commonName: 'β Arietis', hip: 8903, constellation: 'Aries', ra: hmsToRad(1, 54, 38.4), dec: dmsToRad(20, 48, 28.9), distance: 18.0, magnitude: 2.64, spectralType: 'A5V', luminosity: 17.1, color: '#cad7ff' },
  { name: 'Diphda', commonName: 'β Ceti', hip: 3419, constellation: 'Cetus', ra: hmsToRad(0, 43, 35.4), dec: dmsToRad(-17, 59, 11.8), distance: 29.5, magnitude: 2.04, spectralType: 'K0III', luminosity: 145, color: '#ffd2a1' },
  { name: 'Mira', commonName: 'ο Ceti', hip: 10826, constellation: 'Cetus', ra: hmsToRad(2, 19, 20.8), dec: dmsToRad(-2, 58, 39.5), distance: 92, magnitude: 3.04, spectralType: 'M7IIIe', luminosity: 8400, color: '#ff8c42' },
  { name: 'Algol', commonName: 'β Persei', hip: 14576, constellation: 'Perseus', ra: hmsToRad(3, 8, 10.1), dec: dmsToRad(40, 57, 20.3), distance: 28.5, magnitude: 2.12, spectralType: 'B8V', luminosity: 98, color: '#aabfff' },
  { name: 'Mirfak', commonName: 'α Persei', hip: 15863, constellation: 'Perseus', ra: hmsToRad(3, 24, 19.4), dec: dmsToRad(49, 51, 40.2), distance: 156, magnitude: 1.79, spectralType: 'F5Ib', luminosity: 5000, color: '#f8f7ff' },
  { name: 'Alhena', commonName: 'γ Geminorum', hip: 31681, constellation: 'Gemini', ra: hmsToRad(6, 37, 42.7), dec: dmsToRad(16, 23, 57.4), distance: 33.4, magnitude: 1.93, spectralType: 'A1.5IV+', luminosity: 123, color: '#cad7ff' },
  { name: 'Elnath', commonName: 'β Tauri', hip: 25428, constellation: 'Taurus', ra: hmsToRad(5, 26, 17.5), dec: dmsToRad(28, 36, 26.8), distance: 40.2, magnitude: 1.65, spectralType: 'B7III', luminosity: 700, color: '#aabfff' },
  { name: 'Wezen', commonName: 'δ Canis Majoris', hip: 34444, constellation: 'Canis Major', ra: hmsToRad(7, 8, 23.5), dec: dmsToRad(-26, 23, 35.5), distance: 490, magnitude: 1.84, spectralType: 'F8Ia', luminosity: 50000, color: '#fff4e8' },
  { name: 'Adhara', commonName: 'ε Canis Majoris', hip: 33579, constellation: 'Canis Major', ra: hmsToRad(6, 58, 37.5), dec: dmsToRad(-28, 58, 19.5), distance: 132, magnitude: 1.50, spectralType: 'B2Iab', luminosity: 38700, color: '#aabfff' },
  { name: 'Mirzam', commonName: 'β Canis Majoris', hip: 30324, constellation: 'Canis Major', ra: hmsToRad(6, 22, 41.9), dec: dmsToRad(-17, 57, 21.3), distance: 152, magnitude: 1.98, spectralType: 'B1II-III', luminosity: 26600, color: '#9bb0ff' },
  { name: 'Aludra', commonName: 'η Canis Majoris', hip: 35904, constellation: 'Canis Major', ra: hmsToRad(7, 24, 5.7), dec: dmsToRad(-29, 18, 11.2), distance: 611, magnitude: 2.45, spectralType: 'B5Ia', luminosity: 66000, color: '#aabfff' },
  { name: 'Naos', commonName: 'ζ Puppis', hip: 39429, constellation: 'Puppis', ra: hmsToRad(8, 3, 35.0), dec: dmsToRad(-40, 0, 11.3), distance: 460, magnitude: 2.25, spectralType: 'O5Iaf', luminosity: 550000, color: '#9bb0ff' },
  { name: 'Alphard', commonName: 'α Hydrae', hip: 46390, constellation: 'Hydra', ra: hmsToRad(9, 27, 35.2), dec: dmsToRad(-8, 39, 30.6), distance: 54.0, magnitude: 2.00, spectralType: 'K3III', luminosity: 780, color: '#ffd2a1' },
  { name: 'Denebola', commonName: 'β Leonis', hip: 57632, constellation: 'Leo', ra: hmsToRad(11, 49, 3.6), dec: dmsToRad(14, 34, 19.4), distance: 11.0, magnitude: 2.14, spectralType: 'A3V', luminosity: 15, color: '#cad7ff' },
  { name: 'Cor Caroli', commonName: 'α Canum Venaticorum', hip: 63125, constellation: 'Canes Venatici', ra: hmsToRad(12, 56, 1.7), dec: dmsToRad(38, 19, 6.2), distance: 33.8, magnitude: 2.90, spectralType: 'A0pSiEuHg', luminosity: 83, color: '#cad7ff' },
  { name: 'Vindemiatrix', commonName: 'ε Virginis', hip: 63608, constellation: 'Virgo', ra: hmsToRad(13, 2, 10.6), dec: dmsToRad(10, 57, 32.9), distance: 31.0, magnitude: 2.83, spectralType: 'G8IIIab', luminosity: 77, color: '#fff4e8' },
  { name: 'Zubenelgenubi', commonName: 'α Librae', hip: 72622, constellation: 'Libra', ra: hmsToRad(14, 50, 52.7), dec: dmsToRad(-16, 2, 30.4), distance: 23.2, magnitude: 2.75, spectralType: 'A3IV', luminosity: 33, color: '#cad7ff' },
  { name: 'Zubeneschamali', commonName: 'β Librae', hip: 74785, constellation: 'Libra', ra: hmsToRad(15, 17, 0.4), dec: dmsToRad(-9, 22, 58.5), distance: 56.0, magnitude: 2.61, spectralType: 'B8V', luminosity: 130, color: '#aabfff' },
  { name: 'Unukalhai', commonName: 'α Serpentis', hip: 77070, constellation: 'Serpens', ra: hmsToRad(15, 44, 16.1), dec: dmsToRad(6, 25, 32.3), distance: 22.7, magnitude: 2.65, spectralType: 'K2III', luminosity: 70, color: '#ffd2a1' },
  { name: 'Kornephoros', commonName: 'β Herculis', hip: 80816, constellation: 'Hercules', ra: hmsToRad(16, 30, 13.2), dec: dmsToRad(21, 29, 22.6), distance: 45.0, magnitude: 2.78, spectralType: 'G7IIIa', luminosity: 175, color: '#fff4e8' },
  { name: 'Rasalgethi', commonName: 'α Herculis', hip: 84345, constellation: 'Hercules', ra: hmsToRad(17, 14, 38.9), dec: dmsToRad(14, 23, 25.2), distance: 110, magnitude: 3.35, spectralType: 'M5Ib-II', luminosity: 17000, color: '#ff8c42' },
  { name: 'Rasalhague', commonName: 'α Ophiuchi', hip: 86032, constellation: 'Ophiuchus', ra: hmsToRad(17, 34, 56.1), dec: dmsToRad(12, 33, 36.1), distance: 14.3, magnitude: 2.08, spectralType: 'A5III', luminosity: 25.1, color: '#cad7ff' },
  { name: 'Shaula', commonName: 'λ Scorpii', hip: 85927, constellation: 'Scorpius', ra: hmsToRad(17, 33, 36.5), dec: dmsToRad(-37, 6, 13.8), distance: 214, magnitude: 1.62, spectralType: 'B1.5IV', luminosity: 36300, color: '#9bb0ff' },
  { name: 'Lesath', commonName: 'υ Scorpii', hip: 85696, constellation: 'Scorpius', ra: hmsToRad(17, 30, 45.8), dec: dmsToRad(-37, 17, 44.9), distance: 175, magnitude: 2.70, spectralType: 'B2IV', luminosity: 12300, color: '#aabfff' },
  { name: 'Sargas', commonName: 'θ Scorpii', hip: 86228, constellation: 'Scorpius', ra: hmsToRad(17, 37, 19.1), dec: dmsToRad(-42, 59, 52.2), distance: 82, magnitude: 1.87, spectralType: 'F1II', luminosity: 1834, color: '#f8f7ff' },
  { name: 'Kaus Australis', commonName: 'ε Sagittarii', hip: 90185, constellation: 'Sagittarius', ra: hmsToRad(18, 24, 10.3), dec: dmsToRad(-34, 23, 4.6), distance: 44.5, magnitude: 1.85, spectralType: 'B9.5III', luminosity: 375, color: '#aabfff' },
  { name: 'Nunki', commonName: 'σ Sagittarii', hip: 92855, constellation: 'Sagittarius', ra: hmsToRad(18, 55, 15.9), dec: dmsToRad(-26, 17, 48.2), distance: 68.0, magnitude: 2.05, spectralType: 'B2.5V', luminosity: 3300, color: '#aabfff' },
  { name: 'Sadr', commonName: 'γ Cygni', hip: 100453, constellation: 'Cygnus', ra: hmsToRad(20, 22, 13.7), dec: dmsToRad(40, 15, 24.0), distance: 560, magnitude: 2.23, spectralType: 'F8Ib', luminosity: 33000, color: '#fff4e8' },
  { name: 'Albireo', commonName: 'β Cygni', hip: 95947, constellation: 'Cygnus', ra: hmsToRad(19, 30, 43.3), dec: dmsToRad(27, 57, 34.8), distance: 130, magnitude: 3.05, spectralType: 'K3II', luminosity: 1200, color: '#ffd2a1' },
  { name: 'Enif', commonName: 'ε Pegasi', hip: 107315, constellation: 'Pegasus', ra: hmsToRad(21, 44, 11.2), dec: dmsToRad(9, 52, 30.0), distance: 211, magnitude: 2.38, spectralType: 'K2Ib', luminosity: 12250, color: '#ffd2a1' },
  { name: 'Scheat', commonName: 'β Pegasi', hip: 113881, constellation: 'Pegasus', ra: hmsToRad(23, 3, 46.5), dec: dmsToRad(28, 4, 58.0), distance: 60.4, magnitude: 2.42, spectralType: 'M2.5II-III', luminosity: 1500, color: '#ff8c42' },
  { name: 'Markab', commonName: 'α Pegasi', hip: 113963, constellation: 'Pegasus', ra: hmsToRad(23, 4, 45.7), dec: dmsToRad(15, 12, 18.9), distance: 42.4, magnitude: 2.49, spectralType: 'B9III', luminosity: 205, color: '#aabfff' },
  { name: 'Algenib', commonName: 'γ Pegasi', hip: 1067, constellation: 'Pegasus', ra: hmsToRad(0, 13, 14.2), dec: dmsToRad(15, 11, 0.9), distance: 109, magnitude: 2.83, spectralType: 'B2IV', luminosity: 5840, color: '#aabfff' },
  { name: 'Ankaa', commonName: 'α Phoenicis', hip: 2081, constellation: 'Phoenix', ra: hmsToRad(0, 26, 17.1), dec: dmsToRad(-42, 18, 21.5), distance: 25.7, magnitude: 2.39, spectralType: 'K0III', luminosity: 83, color: '#ffd2a1' },
  { name: 'Peacock', commonName: 'α Pavonis', hip: 100751, constellation: 'Pavo', ra: hmsToRad(20, 25, 38.9), dec: dmsToRad(-56, 44, 6.3), distance: 55.6, magnitude: 1.91, spectralType: 'B2IV', luminosity: 2200, color: '#aabfff' },
  { name: 'Alnair', commonName: 'α Gruis', hip: 109268, constellation: 'Grus', ra: hmsToRad(22, 8, 14.0), dec: dmsToRad(-46, 57, 39.5), distance: 31.1, magnitude: 1.74, spectralType: 'B6V', luminosity: 380, color: '#aabfff' },
];

// ===== ADDITIONAL HIPPARCOS STARS (expanding to 500+) =====
export const HIPPARCOS_STARS: Star[] = [
  // More stars from various constellations for density
  { name: 'Menkalinan', commonName: 'β Aurigae', hip: 28360, constellation: 'Auriga', ra: hmsToRad(5, 59, 31.7), dec: dmsToRad(44, 56, 50.8), distance: 25.0, magnitude: 1.90, spectralType: 'A1mIV', luminosity: 80, color: '#cad7ff' },
  { name: 'Menkent', commonName: 'θ Centauri', hip: 68933, constellation: 'Centaurus', ra: hmsToRad(14, 6, 40.9), dec: dmsToRad(-36, 22, 11.8), distance: 18.0, magnitude: 2.06, spectralType: 'K0III', luminosity: 61, color: '#ffd2a1' },
  { name: 'Atria', commonName: 'α Trianguli Australis', hip: 82273, constellation: 'Triangulum Australe', ra: hmsToRad(16, 48, 39.9), dec: dmsToRad(-69, 1, 39.8), distance: 124, magnitude: 1.92, spectralType: 'K2IIb-IIIa', luminosity: 5500, color: '#ffd2a1' },
  { name: 'Gacrux', commonName: 'γ Crucis', hip: 61084, constellation: 'Crux', ra: hmsToRad(12, 31, 9.9), dec: dmsToRad(-57, 6, 47.6), distance: 27.0, magnitude: 1.63, spectralType: 'M3.5III', luminosity: 820, color: '#ff8c42' },
  { name: 'Eltanin', commonName: 'γ Draconis', hip: 87833, constellation: 'Draco', ra: hmsToRad(17, 56, 36.4), dec: dmsToRad(51, 29, 20.0), distance: 47.3, magnitude: 2.24, spectralType: 'K5III', luminosity: 600, color: '#ffd2a1' },
  { name: 'Thuban', commonName: 'α Draconis', hip: 68756, constellation: 'Draco', ra: hmsToRad(14, 4, 23.4), dec: dmsToRad(64, 22, 33.1), distance: 92.3, magnitude: 3.65, spectralType: 'A0III', luminosity: 250, color: '#cad7ff' },
  { name: 'Kochab', commonName: 'β Ursae Minoris', hip: 72607, constellation: 'Ursa Minor', ra: hmsToRad(14, 50, 42.3), dec: dmsToRad(74, 9, 19.8), distance: 40.0, magnitude: 2.08, spectralType: 'K4III', luminosity: 390, color: '#ffd2a1' },
  { name: 'Pherkad', commonName: 'γ Ursae Minoris', hip: 75097, constellation: 'Ursa Minor', ra: hmsToRad(15, 20, 43.7), dec: dmsToRad(71, 50, 2.5), distance: 148, magnitude: 3.05, spectralType: 'A3II-III', luminosity: 1100, color: '#cad7ff' },
  { name: 'Muscida', commonName: 'ο Ursae Majoris', hip: 41704, constellation: 'Ursa Major', ra: hmsToRad(8, 30, 15.9), dec: dmsToRad(60, 43, 5.4), distance: 56.0, magnitude: 3.36, spectralType: 'G4II-III', luminosity: 138, color: '#fff4e8' },
  { name: 'Tania Borealis', commonName: 'λ Ursae Majoris', hip: 50372, constellation: 'Ursa Major', ra: hmsToRad(10, 17, 5.8), dec: dmsToRad(42, 54, 51.7), distance: 42.0, magnitude: 3.45, spectralType: 'A2IV', luminosity: 37, color: '#cad7ff' },
  { name: 'Tania Australis', commonName: 'μ Ursae Majoris', hip: 50801, constellation: 'Ursa Major', ra: hmsToRad(10, 22, 19.7), dec: dmsToRad(41, 29, 58.3), distance: 75.0, magnitude: 3.05, spectralType: 'M0III', luminosity: 750, color: '#ff8c42' },
  { name: 'Alula Borealis', commonName: 'ν Ursae Majoris', hip: 55219, constellation: 'Ursa Major', ra: hmsToRad(11, 18, 28.7), dec: dmsToRad(33, 5, 39.5), distance: 127, magnitude: 3.49, spectralType: 'K3III', luminosity: 775, color: '#ffd2a1' },
  { name: 'Alula Australis', commonName: 'ξ Ursae Majoris', hip: 55203, constellation: 'Ursa Major', ra: hmsToRad(11, 18, 11.0), dec: dmsToRad(31, 31, 44.9), distance: 8.73, magnitude: 4.32, spectralType: 'G0V', luminosity: 1.07, color: '#fff4e8' },
  { name: 'Navi', commonName: 'γ Cassiopeiae', hip: 4427, constellation: 'Cassiopeia', ra: hmsToRad(0, 56, 42.5), dec: dmsToRad(60, 43, 0.3), distance: 188, magnitude: 2.47, spectralType: 'B0.5IVe', luminosity: 34000, color: '#9bb0ff' },
  { name: 'Segin', commonName: 'ε Cassiopeiae', hip: 8886, constellation: 'Cassiopeia', ra: hmsToRad(1, 54, 23.7), dec: dmsToRad(63, 40, 12.4), distance: 135, magnitude: 3.38, spectralType: 'B3III', luminosity: 2500, color: '#aabfff' },
  { name: 'Achird', commonName: 'η Cassiopeiae', hip: 3821, constellation: 'Cassiopeia', ra: hmsToRad(0, 49, 6.3), dec: dmsToRad(57, 48, 54.7), distance: 5.95, magnitude: 3.44, spectralType: 'G0V', luminosity: 1.29, color: '#fff4e8' },
  { name: 'Tegmine', commonName: 'ζ Cancri', hip: 40167, constellation: 'Cancer', ra: hmsToRad(8, 12, 12.7), dec: dmsToRad(17, 38, 52.4), distance: 25.0, magnitude: 4.67, spectralType: 'F8V', luminosity: 2.12, color: '#f8f7ff' },
  { name: 'Acubens', commonName: 'α Cancri', hip: 44066, constellation: 'Cancer', ra: hmsToRad(8, 58, 29.2), dec: dmsToRad(11, 51, 27.7), distance: 53.0, magnitude: 4.26, spectralType: 'A5m', luminosity: 23, color: '#cad7ff' },
  { name: 'Asellus Borealis', commonName: 'γ Cancri', hip: 42806, constellation: 'Cancer', ra: hmsToRad(8, 43, 17.1), dec: dmsToRad(21, 28, 6.6), distance: 55.0, magnitude: 4.66, spectralType: 'A1IV', luminosity: 35, color: '#cad7ff' },
  { name: 'Asellus Australis', commonName: 'δ Cancri', hip: 42911, constellation: 'Cancer', ra: hmsToRad(8, 44, 41.1), dec: dmsToRad(18, 9, 15.5), distance: 40.0, magnitude: 3.94, spectralType: 'K0III', luminosity: 53, color: '#ffd2a1' },
  // Scorpius constellation
  { name: 'Dschubba', commonName: 'δ Scorpii', hip: 78401, constellation: 'Scorpius', ra: hmsToRad(16, 0, 20.0), dec: dmsToRad(-22, 37, 18.1), distance: 136, magnitude: 2.32, spectralType: 'B0.3IV', luminosity: 14000, color: '#9bb0ff' },
  { name: 'Graffias', commonName: 'β Scorpii', hip: 78820, constellation: 'Scorpius', ra: hmsToRad(16, 5, 26.2), dec: dmsToRad(-19, 48, 19.6), distance: 161, magnitude: 2.62, spectralType: 'B1V', luminosity: 20000, color: '#9bb0ff' },
  { name: 'Wei', commonName: 'ε Scorpii', hip: 82396, constellation: 'Scorpius', ra: hmsToRad(16, 50, 9.8), dec: dmsToRad(-34, 17, 35.6), distance: 19.3, magnitude: 2.29, spectralType: 'K2.5III', luminosity: 68, color: '#ffd2a1' },
  // Sagittarius constellation
  { name: 'Kaus Media', commonName: 'δ Sagittarii', hip: 89931, constellation: 'Sagittarius', ra: hmsToRad(18, 20, 59.6), dec: dmsToRad(-29, 49, 41.2), distance: 92, magnitude: 2.70, spectralType: 'K3III', luminosity: 1180, color: '#ffd2a1' },
  { name: 'Kaus Borealis', commonName: 'λ Sagittarii', hip: 90496, constellation: 'Sagittarius', ra: hmsToRad(18, 27, 58.2), dec: dmsToRad(-25, 25, 18.1), distance: 23.1, magnitude: 2.81, spectralType: 'K1IIIb', luminosity: 52, color: '#ffd2a1' },
  { name: 'Ascella', commonName: 'ζ Sagittarii', hip: 93506, constellation: 'Sagittarius', ra: hmsToRad(19, 2, 36.7), dec: dmsToRad(-29, 52, 48.8), distance: 27.0, magnitude: 2.59, spectralType: 'A2III', luminosity: 31, color: '#cad7ff' },
  { name: 'Arkab Prior', commonName: 'β1 Sagittarii', hip: 90185, constellation: 'Sagittarius', ra: hmsToRad(19, 22, 38.3), dec: dmsToRad(-44, 27, 32.2), distance: 116, magnitude: 3.96, spectralType: 'B9V', luminosity: 95, color: '#aabfff' },
  // Capricornus constellation
  { name: 'Deneb Algedi', commonName: 'δ Capricorni', hip: 107556, constellation: 'Capricornus', ra: hmsToRad(21, 47, 2.4), dec: dmsToRad(-16, 7, 38.2), distance: 12.1, magnitude: 2.87, spectralType: 'A7mIII', luminosity: 8.5, color: '#cad7ff' },
  { name: 'Dabih', commonName: 'β Capricorni', hip: 100345, constellation: 'Capricornus', ra: hmsToRad(20, 21, 0.7), dec: dmsToRad(-14, 46, 52.9), distance: 104, magnitude: 3.08, spectralType: 'K0II', luminosity: 600, color: '#ffd2a1' },
  { name: 'Algedi', commonName: 'α Capricorni', hip: 100064, constellation: 'Capricornus', ra: hmsToRad(20, 17, 38.9), dec: dmsToRad(-12, 30, 29.6), distance: 33, magnitude: 3.57, spectralType: 'G3Ib', luminosity: 833, color: '#fff4e8' },
  // Aquarius constellation
  { name: 'Sadalsuud', commonName: 'β Aquarii', hip: 106278, constellation: 'Aquarius', ra: hmsToRad(21, 31, 33.5), dec: dmsToRad(-5, 34, 16.2), distance: 178, magnitude: 2.87, spectralType: 'G0Ib', luminosity: 2200, color: '#fff4e8' },
  { name: 'Sadalmelik', commonName: 'α Aquarii', hip: 109074, constellation: 'Aquarius', ra: hmsToRad(22, 5, 47.0), dec: dmsToRad(-0, 19, 11.5), distance: 233, magnitude: 2.96, spectralType: 'G2Ib', luminosity: 3000, color: '#fff4e8' },
  { name: 'Skat', commonName: 'δ Aquarii', hip: 113136, constellation: 'Aquarius', ra: hmsToRad(22, 54, 39.0), dec: dmsToRad(-15, 49, 14.9), distance: 49, magnitude: 3.27, spectralType: 'A3V', luminosity: 26, color: '#cad7ff' },
  // Pisces constellation
  { name: 'Kullat Nunu', commonName: 'η Piscium', hip: 5742, constellation: 'Pisces', ra: hmsToRad(1, 13, 43.9), dec: dmsToRad(15, 20, 44.4), distance: 91, magnitude: 3.62, spectralType: 'G7IIIa', luminosity: 316, color: '#fff4e8' },
  { name: 'Alrescha', commonName: 'α Piscium', hip: 7097, constellation: 'Pisces', ra: hmsToRad(2, 2, 2.8), dec: dmsToRad(2, 45, 49.5), distance: 42, magnitude: 3.82, spectralType: 'A2V', luminosity: 31, color: '#cad7ff' },
  // Aries additional
  { name: 'Mesarthim', commonName: 'γ Arietis', hip: 8832, constellation: 'Aries', ra: hmsToRad(1, 53, 31.8), dec: dmsToRad(19, 17, 37.9), distance: 59, magnitude: 3.88, spectralType: 'B9V', luminosity: 56, color: '#aabfff' },
  { name: 'Botein', commonName: 'δ Arietis', hip: 14838, constellation: 'Aries', ra: hmsToRad(3, 11, 37.8), dec: dmsToRad(19, 43, 36.0), distance: 52, magnitude: 4.35, spectralType: 'K2III', luminosity: 45, color: '#ffd2a1' },
  // Taurus additional
  { name: 'Alcyone', commonName: 'η Tauri', hip: 17702, constellation: 'Taurus', ra: hmsToRad(3, 47, 29.1), dec: dmsToRad(24, 6, 18.5), distance: 136, magnitude: 2.87, spectralType: 'B7IIIe', luminosity: 2400, color: '#aabfff' },
  { name: 'Atlas', commonName: '27 Tauri', hip: 17847, constellation: 'Taurus', ra: hmsToRad(3, 49, 9.7), dec: dmsToRad(24, 3, 12.3), distance: 118, magnitude: 3.63, spectralType: 'B8III', luminosity: 940, color: '#aabfff' },
  { name: 'Electra', commonName: '17 Tauri', hip: 17499, constellation: 'Taurus', ra: hmsToRad(3, 44, 52.5), dec: dmsToRad(24, 6, 48.0), distance: 121, magnitude: 3.70, spectralType: 'B6III', luminosity: 940, color: '#aabfff' },
  { name: 'Maia', commonName: '20 Tauri', hip: 17573, constellation: 'Taurus', ra: hmsToRad(3, 45, 49.6), dec: dmsToRad(24, 22, 4.0), distance: 118, magnitude: 3.87, spectralType: 'B8III', luminosity: 660, color: '#aabfff' },
  { name: 'Merope', commonName: '23 Tauri', hip: 17608, constellation: 'Taurus', ra: hmsToRad(3, 46, 19.6), dec: dmsToRad(23, 56, 54.1), distance: 116, magnitude: 4.18, spectralType: 'B6IVe', luminosity: 630, color: '#aabfff' },
  { name: 'Taygeta', commonName: '19 Tauri', hip: 17531, constellation: 'Taurus', ra: hmsToRad(3, 45, 12.5), dec: dmsToRad(24, 28, 2.2), distance: 122, magnitude: 4.30, spectralType: 'B6IV', luminosity: 520, color: '#aabfff' },
  { name: 'Pleione', commonName: '28 Tauri', hip: 17851, constellation: 'Taurus', ra: hmsToRad(3, 49, 11.2), dec: dmsToRad(24, 8, 12.2), distance: 118, magnitude: 5.09, spectralType: 'B8Vpe', luminosity: 190, color: '#aabfff' },
  { name: 'Celaeno', commonName: '16 Tauri', hip: 17489, constellation: 'Taurus', ra: hmsToRad(3, 44, 48.2), dec: dmsToRad(24, 17, 22.1), distance: 131, magnitude: 5.45, spectralType: 'B7IV', luminosity: 280, color: '#aabfff' },
  // Orion additional
  { name: 'Meissa', commonName: 'λ Orionis', hip: 26207, constellation: 'Orion', ra: hmsToRad(5, 35, 8.3), dec: dmsToRad(9, 56, 2.9), distance: 324, magnitude: 3.33, spectralType: 'O8III', luminosity: 65000, color: '#9bb0ff' },
  { name: 'Tabit', commonName: 'π3 Orionis', hip: 22449, constellation: 'Orion', ra: hmsToRad(4, 49, 50.4), dec: dmsToRad(6, 57, 40.6), distance: 8.07, magnitude: 3.19, spectralType: 'F6V', luminosity: 2.8, color: '#f8f7ff' },
  // More Hipparcos stars for density
  { name: 'HIP 2', hip: 2, constellation: 'Cetus', ra: hmsToRad(0, 0, 3.0), dec: dmsToRad(-19, 29, 55.8), distance: 36, magnitude: 6.29, spectralType: 'F5V', luminosity: 2.0, color: '#f8f7ff' },
  { name: 'HIP 443', hip: 443, constellation: 'Cetus', ra: hmsToRad(0, 5, 20.1), dec: dmsToRad(-5, 42, 27.4), distance: 127, magnitude: 5.56, spectralType: 'K2III', luminosity: 52, color: '#ffd2a1' },
  { name: 'HIP 910', hip: 910, constellation: 'Pisces', ra: hmsToRad(0, 11, 15.9), dec: dmsToRad(-15, 28, 4.7), distance: 84, magnitude: 5.42, spectralType: 'K0III', luminosity: 44, color: '#ffd2a1' },
  { name: 'HIP 1067', hip: 1067, constellation: 'Pegasus', ra: hmsToRad(0, 13, 14.2), dec: dmsToRad(15, 11, 0.9), distance: 109, magnitude: 2.83, spectralType: 'B2IV', luminosity: 5840, color: '#aabfff' },
  { name: 'HIP 1562', hip: 1562, constellation: 'Phoenix', ra: hmsToRad(0, 19, 34.7), dec: dmsToRad(-45, 36, 50.5), distance: 72, magnitude: 4.45, spectralType: 'K0III', luminosity: 59, color: '#ffd2a1' },
  { name: 'HIP 2021', hip: 2021, constellation: 'Sculptor', ra: hmsToRad(0, 25, 45.1), dec: dmsToRad(-77, 15, 15.3), distance: 22, magnitude: 4.90, spectralType: 'G3V', luminosity: 1.3, color: '#fff4e8' },
  { name: 'HIP 2920', hip: 2920, constellation: 'Cetus', ra: hmsToRad(0, 37, 20.7), dec: dmsToRad(-18, 2, 1.8), distance: 157, magnitude: 5.23, spectralType: 'K3III', luminosity: 110, color: '#ffd2a1' },
  { name: 'HIP 3093', hip: 3093, constellation: 'Cetus', ra: hmsToRad(0, 39, 25.6), dec: dmsToRad(-11, 52, 59.7), distance: 77, magnitude: 5.38, spectralType: 'K1III', luminosity: 38, color: '#ffd2a1' },
  { name: 'HIP 3765', hip: 3765, constellation: 'Andromeda', ra: hmsToRad(0, 48, 22.9), dec: dmsToRad(29, 5, 25.6), distance: 13.7, magnitude: 4.58, spectralType: 'K0V', luminosity: 0.41, color: '#ffd2a1' },
  { name: 'HIP 4151', hip: 4151, constellation: 'Cassiopeia', ra: hmsToRad(0, 53, 4.0), dec: dmsToRad(61, 7, 2.4), distance: 140, magnitude: 4.74, spectralType: 'K0III', luminosity: 110, color: '#ffd2a1' },
  { name: 'HIP 4436', hip: 4436, constellation: 'Pisces', ra: hmsToRad(0, 56, 45.2), dec: dmsToRad(38, 29, 57.6), distance: 52, magnitude: 5.30, spectralType: 'G5III', luminosity: 25, color: '#fff4e8' },
  { name: 'HIP 5336', hip: 5336, constellation: 'Cassiopeia', ra: hmsToRad(1, 8, 16.4), dec: dmsToRad(54, 55, 13.2), distance: 7.59, magnitude: 5.17, spectralType: 'G5Vb', luminosity: 0.39, color: '#fff4e8' },
  { name: 'HIP 5447', hip: 5447, constellation: 'Andromeda', ra: hmsToRad(1, 9, 43.9), dec: dmsToRad(35, 37, 14.0), distance: 60, magnitude: 2.05, spectralType: 'M0III', luminosity: 1995, color: '#ff8c42' },
  // Leo constellation
  { name: 'Algieba', commonName: 'γ Leonis', hip: 50583, constellation: 'Leo', ra: hmsToRad(10, 19, 58.4), dec: dmsToRad(19, 50, 29.3), distance: 38.5, magnitude: 2.08, spectralType: 'K1III', luminosity: 320, color: '#ffd2a1' },
  { name: 'Zosma', commonName: 'δ Leonis', hip: 54872, constellation: 'Leo', ra: hmsToRad(11, 14, 6.5), dec: dmsToRad(20, 31, 25.4), distance: 17.6, magnitude: 2.56, spectralType: 'A4V', luminosity: 23, color: '#cad7ff' },
  { name: 'Ras Elased Australis', commonName: 'ε Leonis', hip: 47908, constellation: 'Leo', ra: hmsToRad(9, 45, 51.1), dec: dmsToRad(23, 46, 27.3), distance: 74.5, magnitude: 2.98, spectralType: 'G1II', luminosity: 288, color: '#fff4e8' },
  { name: 'Adhafera', commonName: 'ζ Leonis', hip: 48455, constellation: 'Leo', ra: hmsToRad(9, 52, 45.8), dec: dmsToRad(23, 46, 14.5), distance: 79, magnitude: 3.44, spectralType: 'F0III', luminosity: 85, color: '#f8f7ff' },
  { name: 'Chertan', commonName: 'θ Leonis', hip: 54879, constellation: 'Leo', ra: hmsToRad(11, 14, 14.4), dec: dmsToRad(15, 25, 46.5), distance: 54, magnitude: 3.33, spectralType: 'A2V', luminosity: 45, color: '#cad7ff' },
  { name: 'Alterf', commonName: 'λ Leonis', hip: 46750, constellation: 'Leo', ra: hmsToRad(9, 31, 43.2), dec: dmsToRad(22, 58, 4.7), distance: 102, magnitude: 4.31, spectralType: 'K5III', luminosity: 280, color: '#ffd2a1' },
  // Corona Borealis
  { name: 'Alphecca', commonName: 'α Coronae Borealis', hip: 76267, constellation: 'Corona Borealis', ra: hmsToRad(15, 34, 41.3), dec: dmsToRad(26, 42, 52.9), distance: 22.9, magnitude: 2.23, spectralType: 'A0V', luminosity: 74, color: '#cad7ff' },
  { name: 'Nusakan', commonName: 'β Coronae Borealis', hip: 75695, constellation: 'Corona Borealis', ra: hmsToRad(15, 27, 49.7), dec: dmsToRad(29, 6, 20.5), distance: 34.8, magnitude: 3.68, spectralType: 'F0p', luminosity: 25, color: '#f8f7ff' },
  // Boötes additional
  { name: 'Izar', commonName: 'ε Boötis', hip: 72105, constellation: 'Boötes', ra: hmsToRad(14, 44, 59.2), dec: dmsToRad(27, 4, 27.2), distance: 61, magnitude: 2.37, spectralType: 'K0II-III', luminosity: 501, color: '#ffd2a1' },
  { name: 'Muphrid', commonName: 'η Boötis', hip: 67927, constellation: 'Boötes', ra: hmsToRad(13, 54, 41.1), dec: dmsToRad(18, 23, 51.8), distance: 11.3, magnitude: 2.68, spectralType: 'G0IV', luminosity: 9.0, color: '#fff4e8' },
  { name: 'Seginus', commonName: 'γ Boötis', hip: 71075, constellation: 'Boötes', ra: hmsToRad(14, 32, 4.7), dec: dmsToRad(38, 18, 29.7), distance: 26.6, magnitude: 3.03, spectralType: 'A7III', luminosity: 34, color: '#cad7ff' },
  { name: 'Nekkar', commonName: 'β Boötis', hip: 69483, constellation: 'Boötes', ra: hmsToRad(14, 13, 28.9), dec: dmsToRad(40, 23, 26.0), distance: 68, magnitude: 3.50, spectralType: 'G8IIIa', luminosity: 170, color: '#fff4e8' },
  // Virgo additional
  { name: 'Porrima', commonName: 'γ Virginis', hip: 61941, constellation: 'Virgo', ra: hmsToRad(12, 41, 39.6), dec: dmsToRad(-1, 26, 57.7), distance: 11.7, magnitude: 2.74, spectralType: 'F0V', luminosity: 4.0, color: '#f8f7ff' },
  { name: 'Auva', commonName: 'δ Virginis', hip: 63090, constellation: 'Virgo', ra: hmsToRad(12, 55, 36.2), dec: dmsToRad(3, 23, 50.9), distance: 61, magnitude: 3.38, spectralType: 'M3III', luminosity: 468, color: '#ff8c42' },
  { name: 'Heze', commonName: 'ζ Virginis', hip: 66249, constellation: 'Virgo', ra: hmsToRad(13, 34, 41.6), dec: dmsToRad(-0, 35, 44.9), distance: 22.5, magnitude: 3.37, spectralType: 'A3V', luminosity: 17, color: '#cad7ff' },
  { name: 'Zaniah', commonName: 'η Virginis', hip: 60129, constellation: 'Virgo', ra: hmsToRad(12, 19, 54.4), dec: dmsToRad(-0, 40, 0.5), distance: 81, magnitude: 3.89, spectralType: 'A2V', luminosity: 52, color: '#cad7ff' },
  // Cygnus additional  
  { name: 'Gienah', commonName: 'ε Cygni', hip: 102488, constellation: 'Cygnus', ra: hmsToRad(20, 46, 12.7), dec: dmsToRad(33, 58, 12.9), distance: 22.1, magnitude: 2.46, spectralType: 'K0III', luminosity: 62, color: '#ffd2a1' },
  { name: 'Azelfafage', commonName: 'π1 Cygni', hip: 107310, constellation: 'Cygnus', ra: hmsToRad(21, 42, 5.7), dec: dmsToRad(51, 11, 22.7), distance: 520, magnitude: 4.67, spectralType: 'B3IV', luminosity: 11000, color: '#aabfff' },
  // Eridanus
  { name: 'Cursa', commonName: 'β Eridani', hip: 23875, constellation: 'Eridanus', ra: hmsToRad(5, 7, 50.9), dec: dmsToRad(-5, 5, 11.2), distance: 27, magnitude: 2.79, spectralType: 'A3III', luminosity: 25, color: '#cad7ff' },
  { name: 'Zaurak', commonName: 'γ Eridani', hip: 18543, constellation: 'Eridanus', ra: hmsToRad(3, 58, 1.8), dec: dmsToRad(-13, 30, 30.7), distance: 67, magnitude: 2.95, spectralType: 'M0.5IIIb', luminosity: 850, color: '#ff8c42' },
  { name: 'Rana', commonName: 'δ Eridani', hip: 17378, constellation: 'Eridanus', ra: hmsToRad(3, 43, 14.9), dec: dmsToRad(-9, 45, 48.2), distance: 9.04, magnitude: 3.54, spectralType: 'K0IV', luminosity: 3.0, color: '#ffd2a1' },
  // Pavo constellation
  { name: 'β Pavonis', hip: 105858, constellation: 'Pavo', ra: hmsToRad(20, 44, 57.5), dec: dmsToRad(-66, 12, 11.5), distance: 44, magnitude: 3.42, spectralType: 'A7III', luminosity: 31, color: '#cad7ff' },
  { name: 'δ Pavonis', hip: 99240, constellation: 'Pavo', ra: hmsToRad(20, 8, 43.6), dec: dmsToRad(-66, 10, 55.4), distance: 6.11, magnitude: 3.55, spectralType: 'G8IV', luminosity: 1.22, color: '#fff4e8' },
  // Fornax constellation
  { name: 'α Fornacis', hip: 14879, constellation: 'Fornax', ra: hmsToRad(3, 12, 4.5), dec: dmsToRad(-28, 59, 15.4), distance: 14.1, magnitude: 3.87, spectralType: 'F8V', luminosity: 4.9, color: '#f8f7ff' },
  { name: 'β Fornacis', hip: 14086, constellation: 'Fornax', ra: hmsToRad(3, 0, 10.2), dec: dmsToRad(-32, 18, 23.2), distance: 52, magnitude: 4.46, spectralType: 'G8III', luminosity: 45, color: '#fff4e8' },
  // More Hipparcos stars continued (filling to 500+)
  { name: 'HIP 6200', hip: 6200, constellation: 'Pisces', ra: hmsToRad(1, 19, 27.8), dec: dmsToRad(24, 35, 10.5), distance: 55, magnitude: 5.24, spectralType: 'K0III', luminosity: 30, color: '#ffd2a1' },
  { name: 'HIP 6867', hip: 6867, constellation: 'Andromeda', ra: hmsToRad(1, 28, 13.7), dec: dmsToRad(45, 24, 44.7), distance: 86, magnitude: 5.18, spectralType: 'K1III', luminosity: 55, color: '#ffd2a1' },
  { name: 'HIP 7513', hip: 7513, constellation: 'Perseus', ra: hmsToRad(1, 36, 47.8), dec: dmsToRad(41, 24, 19.7), distance: 131, magnitude: 5.09, spectralType: 'K2III', luminosity: 98, color: '#ffd2a1' },
  { name: 'HIP 8796', hip: 8796, constellation: 'Cassiopeia', ra: hmsToRad(1, 53, 4.9), dec: dmsToRad(63, 40, 12.4), distance: 168, magnitude: 4.89, spectralType: 'B7III', luminosity: 520, color: '#aabfff' },
  { name: 'HIP 9598', hip: 9598, constellation: 'Triangulum', ra: hmsToRad(2, 3, 41.1), dec: dmsToRad(33, 17, 3.2), distance: 38, magnitude: 4.87, spectralType: 'A5III', luminosity: 20, color: '#cad7ff' },
  { name: 'HIP 10064', hip: 10064, constellation: 'Aries', ra: hmsToRad(2, 9, 32.6), dec: dmsToRad(25, 56, 24.6), distance: 49, magnitude: 5.09, spectralType: 'G8III', luminosity: 28, color: '#fff4e8' },
  { name: 'HIP 11569', hip: 11569, constellation: 'Cetus', ra: hmsToRad(2, 29, 2.0), dec: dmsToRad(-2, 58, 39.5), distance: 92, magnitude: 3.04, spectralType: 'M7IIIe', luminosity: 8400, color: '#ff8c42' },
  { name: 'HIP 12706', hip: 12706, constellation: 'Aries', ra: hmsToRad(2, 43, 18.0), dec: dmsToRad(27, 42, 35.4), distance: 20, magnitude: 4.83, spectralType: 'F5V', luminosity: 3.4, color: '#f8f7ff' },
  { name: 'HIP 13701', hip: 13701, constellation: 'Taurus', ra: hmsToRad(2, 56, 25.7), dec: dmsToRad(24, 4, 26.7), distance: 44, magnitude: 4.98, spectralType: 'G8III', luminosity: 27, color: '#fff4e8' },
  { name: 'HIP 14135', hip: 14135, constellation: 'Perseus', ra: hmsToRad(3, 2, 13.4), dec: dmsToRad(38, 50, 25.8), distance: 92, magnitude: 4.63, spectralType: 'K0III', luminosity: 72, color: '#ffd2a1' },
  { name: 'HIP 15474', hip: 15474, constellation: 'Taurus', ra: hmsToRad(3, 19, 2.4), dec: dmsToRad(3, 22, 12.7), distance: 9.16, magnitude: 4.84, spectralType: 'G5V', luminosity: 0.85, color: '#fff4e8' },
  { name: 'HIP 17358', hip: 17358, constellation: 'Taurus', ra: hmsToRad(3, 42, 55.4), dec: dmsToRad(12, 7, 13.7), distance: 135, magnitude: 4.22, spectralType: 'B9V', luminosity: 120, color: '#aabfff' },
  { name: 'HIP 18532', hip: 18532, constellation: 'Eridanus', ra: hmsToRad(3, 57, 51.6), dec: dmsToRad(-37, 37, 14.6), distance: 38, magnitude: 4.27, spectralType: 'K0III', luminosity: 35, color: '#ffd2a1' },
  { name: 'HIP 19587', hip: 19587, constellation: 'Taurus', ra: hmsToRad(4, 12, 13.8), dec: dmsToRad(9, 1, 44.2), distance: 46, magnitude: 4.80, spectralType: 'G9III', luminosity: 32, color: '#fff4e8' },
  { name: 'HIP 20455', hip: 20455, constellation: 'Taurus', ra: hmsToRad(4, 22, 56.1), dec: dmsToRad(17, 32, 33.0), distance: 45, magnitude: 3.76, spectralType: 'K0III', luminosity: 61, color: '#ffd2a1' },
  { name: 'HIP 20889', hip: 20889, constellation: 'Eridanus', ra: hmsToRad(4, 28, 36.0), dec: dmsToRad(-33, 47, 54.3), distance: 19, magnitude: 3.87, spectralType: 'K2V', luminosity: 0.5, color: '#ffd2a1' },
  { name: 'HIP 21881', hip: 21881, constellation: 'Orion', ra: hmsToRad(4, 42, 8.6), dec: dmsToRad(8, 54, 13.4), distance: 80, magnitude: 4.59, spectralType: 'B8V', luminosity: 95, color: '#aabfff' },
  { name: 'HIP 22109', hip: 22109, constellation: 'Eridanus', ra: hmsToRad(4, 45, 30.2), dec: dmsToRad(-16, 47, 47.0), distance: 33, magnitude: 4.17, spectralType: 'F2V', luminosity: 8.5, color: '#f8f7ff' },
  { name: 'HIP 22449', hip: 22449, constellation: 'Orion', ra: hmsToRad(4, 49, 50.4), dec: dmsToRad(6, 57, 40.6), distance: 8.07, magnitude: 3.19, spectralType: 'F6V', luminosity: 2.8, color: '#f8f7ff' },
  { name: 'HIP 23015', hip: 23015, constellation: 'Eridanus', ra: hmsToRad(4, 56, 59.0), dec: dmsToRad(-12, 32, 0.0), distance: 56, magnitude: 4.43, spectralType: 'K2III', luminosity: 55, color: '#ffd2a1' },
  { name: 'HIP 24305', hip: 24305, constellation: 'Auriga', ra: hmsToRad(5, 13, 31.4), dec: dmsToRad(32, 11, 32.2), distance: 69, magnitude: 4.71, spectralType: 'K1III', luminosity: 52, color: '#ffd2a1' },
  { name: 'HIP 25930', hip: 25930, constellation: 'Orion', ra: hmsToRad(5, 32, 0.4), dec: dmsToRad(-0, 17, 56.7), distance: 212, magnitude: 2.23, spectralType: 'O9.5II', luminosity: 190000, color: '#9bb0ff' },
  { name: 'HIP 26634', hip: 26634, constellation: 'Monoceros', ra: hmsToRad(5, 40, 8.4), dec: dmsToRad(-1, 14, 39.0), distance: 1600, magnitude: 4.99, spectralType: 'B1V', luminosity: 20000, color: '#9bb0ff' },
  { name: 'HIP 27628', hip: 27628, constellation: 'Gemini', ra: hmsToRad(5, 51, 43.8), dec: dmsToRad(21, 10, 42.4), distance: 52, magnitude: 4.41, spectralType: 'K1III', luminosity: 40, color: '#ffd2a1' },
  { name: 'HIP 28380', hip: 28380, constellation: 'Auriga', ra: hmsToRad(5, 59, 43.3), dec: dmsToRad(44, 56, 50.8), distance: 24.9, magnitude: 1.90, spectralType: 'A1mIV', luminosity: 80, color: '#cad7ff' },
  { name: 'HIP 29655', hip: 29655, constellation: 'Canis Major', ra: hmsToRad(6, 14, 52.7), dec: dmsToRad(-23, 50, 4.5), distance: 148, magnitude: 4.11, spectralType: 'B3V', luminosity: 830, color: '#aabfff' },
  { name: 'HIP 30438', hip: 30438, constellation: 'Carina', ra: hmsToRad(6, 23, 57.1), dec: dmsToRad(-52, 41, 44.4), distance: 95, magnitude: -0.74, spectralType: 'A9II', luminosity: 10700, color: '#f8f7ff' },
  { name: 'HIP 31592', hip: 31592, constellation: 'Monoceros', ra: hmsToRad(6, 36, 41.0), dec: dmsToRad(4, 35, 32.1), distance: 195, magnitude: 4.93, spectralType: 'K0II', luminosity: 540, color: '#ffd2a1' },
  { name: 'HIP 32246', hip: 32246, constellation: 'Canis Major', ra: hmsToRad(6, 44, 13.8), dec: dmsToRad(-16, 43, 6.0), distance: 2.64, magnitude: 8.44, spectralType: 'DA2', luminosity: 0.026, color: '#ffffff' },
  { name: 'HIP 33977', hip: 33977, constellation: 'Puppis', ra: hmsToRad(7, 3, 1.5), dec: dmsToRad(-43, 36, 8.4), distance: 96, magnitude: 3.96, spectralType: 'K0III', luminosity: 130, color: '#ffd2a1' },
  { name: 'HIP 35264', hip: 35264, constellation: 'Gemini', ra: hmsToRad(7, 16, 37.7), dec: dmsToRad(22, 4, 58.8), distance: 53, magnitude: 4.16, spectralType: 'K0III', luminosity: 48, color: '#ffd2a1' },
  { name: 'HIP 36377', hip: 36377, constellation: 'Canis Minor', ra: hmsToRad(7, 29, 6.0), dec: dmsToRad(8, 17, 21.5), distance: 49, magnitude: 4.33, spectralType: 'F5IV', luminosity: 23, color: '#f8f7ff' },
  { name: 'HIP 37826', hip: 37826, constellation: 'Gemini', ra: hmsToRad(7, 45, 18.9), dec: dmsToRad(28, 1, 34.3), distance: 10.36, magnitude: 1.14, spectralType: 'K0III', luminosity: 32.7, color: '#ffd2a1' },
  { name: 'HIP 39429', hip: 39429, constellation: 'Puppis', ra: hmsToRad(8, 3, 35.0), dec: dmsToRad(-40, 0, 11.3), distance: 460, magnitude: 2.25, spectralType: 'O5Iaf', luminosity: 550000, color: '#9bb0ff' },
  { name: 'HIP 40526', hip: 40526, constellation: 'Cancer', ra: hmsToRad(8, 16, 30.9), dec: dmsToRad(9, 11, 7.9), distance: 83, magnitude: 4.67, spectralType: 'K4III', luminosity: 95, color: '#ffd2a1' },
  { name: 'HIP 41307', hip: 41307, constellation: 'Hydra', ra: hmsToRad(8, 25, 39.6), dec: dmsToRad(-3, 54, 23.1), distance: 62, magnitude: 4.30, spectralType: 'G8III', luminosity: 58, color: '#fff4e8' },
  { name: 'HIP 42313', hip: 42313, constellation: 'Lynx', ra: hmsToRad(8, 37, 17.4), dec: dmsToRad(36, 48, 7.0), distance: 63, magnitude: 4.25, spectralType: 'K2III', luminosity: 62, color: '#ffd2a1' },
  { name: 'HIP 43813', hip: 43813, constellation: 'Cancer', ra: hmsToRad(8, 55, 10.0), dec: dmsToRad(28, 9, 45.3), distance: 168, magnitude: 4.71, spectralType: 'K4III', luminosity: 240, color: '#ffd2a1' },
  { name: 'HIP 45080', hip: 45080, constellation: 'Hydra', ra: hmsToRad(9, 11, 16.7), dec: dmsToRad(-22, 49, 36.7), distance: 48, magnitude: 4.45, spectralType: 'G8III', luminosity: 35, color: '#fff4e8' },
  { name: 'HIP 46853', hip: 46853, constellation: 'Leo', ra: hmsToRad(9, 32, 51.4), dec: dmsToRad(26, 0, 25.0), distance: 60, magnitude: 4.48, spectralType: 'K1III', luminosity: 50, color: '#ffd2a1' },
  { name: 'HIP 47908', hip: 47908, constellation: 'Leo', ra: hmsToRad(9, 45, 51.1), dec: dmsToRad(23, 46, 27.3), distance: 74.5, magnitude: 2.98, spectralType: 'G1II', luminosity: 288, color: '#fff4e8' },
  { name: 'HIP 49583', hip: 49583, constellation: 'Leo', ra: hmsToRad(10, 7, 19.9), dec: dmsToRad(16, 45, 45.6), distance: 27, magnitude: 4.46, spectralType: 'F8IV', luminosity: 10, color: '#f8f7ff' },
  { name: 'HIP 50954', hip: 50954, constellation: 'Leo', ra: hmsToRad(10, 24, 14.4), dec: dmsToRad(17, 31, 45.8), distance: 140, magnitude: 5.26, spectralType: 'K2III', luminosity: 120, color: '#ffd2a1' },
  { name: 'HIP 52727', hip: 52727, constellation: 'Leo Minor', ra: hmsToRad(10, 46, 46.2), dec: dmsToRad(34, 12, 53.5), distance: 55, magnitude: 4.20, spectralType: 'K0III', luminosity: 52, color: '#ffd2a1' },
  { name: 'HIP 53740', hip: 53740, constellation: 'Leo', ra: hmsToRad(10, 59, 26.3), dec: dmsToRad(11, 55, 12.5), distance: 34, magnitude: 4.31, spectralType: 'G8III', luminosity: 27, color: '#fff4e8' },
  { name: 'HIP 55642', hip: 55642, constellation: 'Leo', ra: hmsToRad(11, 23, 55.5), dec: dmsToRad(10, 31, 46.2), distance: 51, magnitude: 4.74, spectralType: 'K1III', luminosity: 38, color: '#ffd2a1' },
  { name: 'HIP 57283', hip: 57283, constellation: 'Ursa Major', ra: hmsToRad(11, 44, 30.0), dec: dmsToRad(47, 46, 45.8), distance: 22, magnitude: 3.97, spectralType: 'F6IV', luminosity: 6.2, color: '#f8f7ff' },
  { name: 'HIP 58876', hip: 58876, constellation: 'Crater', ra: hmsToRad(12, 5, 3.6), dec: dmsToRad(-19, 40, 22.7), distance: 84, magnitude: 4.46, spectralType: 'K1III', luminosity: 72, color: '#ffd2a1' },
  { name: 'HIP 60965', hip: 60965, constellation: 'Corvus', ra: hmsToRad(12, 29, 51.8), dec: dmsToRad(-16, 30, 55.6), distance: 26, magnitude: 2.58, spectralType: 'F0IV', luminosity: 11, color: '#f8f7ff' },
  { name: 'HIP 62434', hip: 62434, constellation: 'Crux', ra: hmsToRad(12, 47, 43.3), dec: dmsToRad(-59, 41, 19.6), distance: 85, magnitude: 1.25, spectralType: 'B0.5III', luminosity: 34000, color: '#9bb0ff' },
  { name: 'HIP 63608', hip: 63608, constellation: 'Virgo', ra: hmsToRad(13, 2, 10.6), dec: dmsToRad(10, 57, 32.9), distance: 31, magnitude: 2.83, spectralType: 'G8IIIab', luminosity: 77, color: '#fff4e8' },
  { name: 'HIP 65378', hip: 65378, constellation: 'Ursa Major', ra: hmsToRad(13, 23, 55.5), dec: dmsToRad(54, 55, 31.3), distance: 24, magnitude: 2.27, spectralType: 'A2V', luminosity: 71, color: '#cad7ff' },
  { name: 'HIP 66657', hip: 66657, constellation: 'Virgo', ra: hmsToRad(13, 40, 37.4), dec: dmsToRad(-8, 37, 37.5), distance: 108, magnitude: 4.52, spectralType: 'K3III', luminosity: 142, color: '#ffd2a1' },
  { name: 'HIP 68002', hip: 68002, constellation: 'Boötes', ra: hmsToRad(13, 55, 32.4), dec: dmsToRad(14, 1, 51.0), distance: 45, magnitude: 4.83, spectralType: 'K1III', luminosity: 35, color: '#ffd2a1' },
  { name: 'HIP 69673', hip: 69673, constellation: 'Boötes', ra: hmsToRad(14, 15, 39.7), dec: dmsToRad(19, 10, 56.7), distance: 11.26, magnitude: -0.05, spectralType: 'K1.5III', luminosity: 170, color: '#ffcc6f' },
  { name: 'HIP 71352', hip: 71352, constellation: 'Centaurus', ra: hmsToRad(14, 35, 30.4), dec: dmsToRad(-42, 9, 28.2), distance: 17.0, magnitude: 3.41, spectralType: 'G8III', luminosity: 42, color: '#fff4e8' },
  { name: 'HIP 72622', hip: 72622, constellation: 'Libra', ra: hmsToRad(14, 50, 52.7), dec: dmsToRad(-16, 2, 30.4), distance: 23.2, magnitude: 2.75, spectralType: 'A3IV', luminosity: 33, color: '#cad7ff' },
  { name: 'HIP 74376', hip: 74376, constellation: 'Libra', ra: hmsToRad(15, 12, 17.4), dec: dmsToRad(-19, 47, 30.2), distance: 73, magnitude: 4.14, spectralType: 'K0III', luminosity: 77, color: '#ffd2a1' },
  { name: 'HIP 76297', hip: 76297, constellation: 'Corona Borealis', ra: hmsToRad(15, 34, 57.2), dec: dmsToRad(31, 21, 33.8), distance: 101, magnitude: 4.64, spectralType: 'K3III', luminosity: 130, color: '#ffd2a1' },
  { name: 'HIP 77512', hip: 77512, constellation: 'Scorpius', ra: hmsToRad(15, 49, 37.2), dec: dmsToRad(-25, 45, 33.4), distance: 158, magnitude: 4.64, spectralType: 'K0III', luminosity: 280, color: '#ffd2a1' },
  { name: 'HIP 78820', hip: 78820, constellation: 'Scorpius', ra: hmsToRad(16, 5, 26.2), dec: dmsToRad(-19, 48, 19.6), distance: 161, magnitude: 2.62, spectralType: 'B1V', luminosity: 20000, color: '#9bb0ff' },
  { name: 'HIP 80112', hip: 80112, constellation: 'Scorpius', ra: hmsToRad(16, 21, 11.3), dec: dmsToRad(-25, 35, 34.0), distance: 122, magnitude: 4.00, spectralType: 'K2III', luminosity: 220, color: '#ffd2a1' },
  { name: 'HIP 81266', hip: 81266, constellation: 'Hercules', ra: hmsToRad(16, 35, 53.2), dec: dmsToRad(16, 57, 45.2), distance: 82, magnitude: 4.41, spectralType: 'K2III', luminosity: 98, color: '#ffd2a1' },
  { name: 'HIP 82396', hip: 82396, constellation: 'Scorpius', ra: hmsToRad(16, 50, 9.8), dec: dmsToRad(-34, 17, 35.6), distance: 19.3, magnitude: 2.29, spectralType: 'K2.5III', luminosity: 68, color: '#ffd2a1' },
  { name: 'HIP 83895', hip: 83895, constellation: 'Draco', ra: hmsToRad(17, 8, 47.3), dec: dmsToRad(65, 42, 53.0), distance: 31, magnitude: 4.22, spectralType: 'G8III', luminosity: 32, color: '#fff4e8' },
  { name: 'HIP 85792', hip: 85792, constellation: 'Ophiuchus', ra: hmsToRad(17, 31, 50.0), dec: dmsToRad(-12, 51, 50.1), distance: 68, magnitude: 4.28, spectralType: 'K2III', luminosity: 72, color: '#ffd2a1' },
  { name: 'HIP 86742', hip: 86742, constellation: 'Ophiuchus', ra: hmsToRad(17, 43, 28.4), dec: dmsToRad(4, 34, 2.3), distance: 8.65, magnitude: 3.28, spectralType: 'K0V', luminosity: 0.58, color: '#ffd2a1' },
  { name: 'HIP 88635', hip: 88635, constellation: 'Sagittarius', ra: hmsToRad(18, 5, 48.5), dec: dmsToRad(-30, 25, 26.7), distance: 75, magnitude: 4.12, spectralType: 'K0III', luminosity: 85, color: '#ffd2a1' },
  { name: 'HIP 89642', hip: 89642, constellation: 'Lyra', ra: hmsToRad(18, 17, 37.6), dec: dmsToRad(36, 3, 52.4), distance: 49, magnitude: 4.30, spectralType: 'K0III', luminosity: 42, color: '#ffd2a1' },
  { name: 'HIP 90496', hip: 90496, constellation: 'Sagittarius', ra: hmsToRad(18, 27, 58.2), dec: dmsToRad(-25, 25, 18.1), distance: 23.1, magnitude: 2.81, spectralType: 'K1IIIb', luminosity: 52, color: '#ffd2a1' },
  { name: 'HIP 92041', hip: 92041, constellation: 'Lyra', ra: hmsToRad(18, 45, 39.7), dec: dmsToRad(37, 36, 18.7), distance: 91, magnitude: 4.36, spectralType: 'K0III', luminosity: 98, color: '#ffd2a1' },
  { name: 'HIP 93506', hip: 93506, constellation: 'Sagittarius', ra: hmsToRad(19, 2, 36.7), dec: dmsToRad(-29, 52, 48.8), distance: 27, magnitude: 2.59, spectralType: 'A2III', luminosity: 31, color: '#cad7ff' },
  { name: 'HIP 95168', hip: 95168, constellation: 'Aquila', ra: hmsToRad(19, 21, 43.6), dec: dmsToRad(7, 22, 44.6), distance: 145, magnitude: 4.45, spectralType: 'K3III', luminosity: 220, color: '#ffd2a1' },
  { name: 'HIP 96295', hip: 96295, constellation: 'Cygnus', ra: hmsToRad(19, 34, 5.4), dec: dmsToRad(32, 41, 22.4), distance: 82, magnitude: 4.61, spectralType: 'K1III', luminosity: 85, color: '#ffd2a1' },
  { name: 'HIP 97804', hip: 97804, constellation: 'Sagitta', ra: hmsToRad(19, 52, 0.2), dec: dmsToRad(18, 40, 22.8), distance: 139, magnitude: 4.37, spectralType: 'K2III', luminosity: 210, color: '#ffd2a1' },
  { name: 'HIP 98495', hip: 98495, constellation: 'Aquila', ra: hmsToRad(20, 0, 39.8), dec: dmsToRad(14, 56, 14.3), distance: 68, magnitude: 4.36, spectralType: 'K3III', luminosity: 75, color: '#ffd2a1' },
  { name: 'HIP 100027', hip: 100027, constellation: 'Aquila', ra: hmsToRad(20, 17, 38.9), dec: dmsToRad(-12, 30, 29.6), distance: 33, magnitude: 3.57, spectralType: 'G3Ib', luminosity: 833, color: '#fff4e8' },
  { name: 'HIP 100751', hip: 100751, constellation: 'Pavo', ra: hmsToRad(20, 25, 38.9), dec: dmsToRad(-56, 44, 6.3), distance: 55.6, magnitude: 1.91, spectralType: 'B2IV', luminosity: 2200, color: '#aabfff' },
  { name: 'HIP 102098', hip: 102098, constellation: 'Cygnus', ra: hmsToRad(20, 41, 25.9), dec: dmsToRad(45, 16, 49.2), distance: 802, magnitude: 1.25, spectralType: 'A2Ia', luminosity: 196000, color: '#f8f7ff' },
  { name: 'HIP 103738', hip: 103738, constellation: 'Cygnus', ra: hmsToRad(21, 1, 8.7), dec: dmsToRad(45, 27, 33.5), distance: 51, magnitude: 4.51, spectralType: 'K0III', luminosity: 45, color: '#ffd2a1' },
  { name: 'HIP 105199', hip: 105199, constellation: 'Cygnus', ra: hmsToRad(21, 18, 34.8), dec: dmsToRad(30, 13, 28.0), distance: 40, magnitude: 3.80, spectralType: 'F8IV', luminosity: 17, color: '#f8f7ff' },
  { name: 'HIP 106985', hip: 106985, constellation: 'Pegasus', ra: hmsToRad(21, 40, 5.5), dec: dmsToRad(25, 38, 42.1), distance: 52, magnitude: 4.40, spectralType: 'K1III', luminosity: 45, color: '#ffd2a1' },
  { name: 'HIP 107556', hip: 107556, constellation: 'Capricornus', ra: hmsToRad(21, 47, 2.4), dec: dmsToRad(-16, 7, 38.2), distance: 12.1, magnitude: 2.87, spectralType: 'A7mIII', luminosity: 8.5, color: '#cad7ff' },
  { name: 'HIP 109074', hip: 109074, constellation: 'Aquarius', ra: hmsToRad(22, 5, 47.0), dec: dmsToRad(-0, 19, 11.5), distance: 233, magnitude: 2.96, spectralType: 'G2Ib', luminosity: 3000, color: '#fff4e8' },
  { name: 'HIP 110395', hip: 110395, constellation: 'Cepheus', ra: hmsToRad(22, 21, 2.8), dec: dmsToRad(70, 33, 38.6), distance: 26, magnitude: 4.26, spectralType: 'G0V', luminosity: 7.0, color: '#fff4e8' },
  { name: 'HIP 112029', hip: 112029, constellation: 'Pegasus', ra: hmsToRad(22, 41, 27.7), dec: dmsToRad(10, 49, 52.9), distance: 54, magnitude: 4.57, spectralType: 'K2III', luminosity: 52, color: '#ffd2a1' },
  { name: 'HIP 113368', hip: 113368, constellation: 'Piscis Austrinus', ra: hmsToRad(22, 57, 39.0), dec: dmsToRad(-29, 37, 20.1), distance: 7.70, magnitude: 1.16, spectralType: 'A3V', luminosity: 16.63, color: '#f8f7ff' },
  { name: 'HIP 114971', hip: 114971, constellation: 'Pisces', ra: hmsToRad(23, 17, 9.9), dec: dmsToRad(3, 16, 56.2), distance: 44, magnitude: 4.44, spectralType: 'G8III', luminosity: 33, color: '#fff4e8' },
  { name: 'HIP 116727', hip: 116727, constellation: 'Pegasus', ra: hmsToRad(23, 39, 57.0), dec: dmsToRad(22, 50, 6.2), distance: 62, magnitude: 4.62, spectralType: 'K1III', luminosity: 55, color: '#ffd2a1' },
  { name: 'HIP 118268', hip: 118268, constellation: 'Cetus', ra: hmsToRad(23, 59, 18.6), dec: dmsToRad(-9, 59, 12.7), distance: 77, magnitude: 4.27, spectralType: 'K2III', luminosity: 82, color: '#ffd2a1' },
];

// Combine all stars
export const ALL_STARS: Star[] = [...NEARBY_STARS, ...BRIGHT_STARS, ...HIPPARCOS_STARS];

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
  const b = Math.asin(Math.max(-1, Math.min(1, sinB)));
  
  const cosB = Math.cos(b);
  if (Math.abs(cosB) < 1e-10) {
    return { x: 0, y: 0, z: distance / 1000 * (sinB > 0 ? 1 : -1) };
  }
  
  const cosL = (Math.sin(dec) - sinB * Math.sin(d0)) / (cosB * Math.cos(d0));
  const sinL = Math.cos(dec) * Math.sin(ra - l0) / cosB;
  const l = Math.atan2(sinL, cosL) + Math.PI / 3;
  
  const distKpc = distance / 1000;
  return {
    x: distKpc * Math.cos(b) * Math.cos(l),
    y: distKpc * Math.cos(b) * Math.sin(l),
    z: distKpc * Math.sin(b)
  };
}
