/**
 * Real Star Catalog - Comprehensive catalog of real stars
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
  { name: 'Proxima Centauri', ra: hmsToRad(14, 29, 43.0), dec: dmsToRad(-62, 40, 46.1), distance: 1.30, magnitude: 11.13, spectralType: 'M5.5Ve', luminosity: 0.0017, color: '#ffcc6f' },
  { name: 'α Centauri A', commonName: 'Rigil Kentaurus', ra: hmsToRad(14, 39, 36.5), dec: dmsToRad(-60, 50, 2.3), distance: 1.34, magnitude: -0.01, spectralType: 'G2V', luminosity: 1.519, color: '#fff4e8' },
  { name: 'α Centauri B', ra: hmsToRad(14, 39, 35.1), dec: dmsToRad(-60, 50, 13.8), distance: 1.34, magnitude: 1.33, spectralType: 'K1V', luminosity: 0.5, color: '#ffd2a1' },
  { name: "Barnard's Star", ra: hmsToRad(17, 57, 48.5), dec: dmsToRad(4, 41, 36.2), distance: 1.83, magnitude: 9.54, spectralType: 'M4Ve', luminosity: 0.0035, color: '#ffcc6f' },
  { name: 'Wolf 359', ra: hmsToRad(10, 56, 29.2), dec: dmsToRad(7, 0, 52.8), distance: 2.39, magnitude: 13.54, spectralType: 'M6.5Ve', luminosity: 0.0014, color: '#ffcc6f' },
  { name: 'Lalande 21185', ra: hmsToRad(11, 3, 20.2), dec: dmsToRad(35, 58, 11.5), distance: 2.55, magnitude: 7.47, spectralType: 'M2V', luminosity: 0.021, color: '#ffcc6f' },
  { name: 'Sirius A', commonName: 'Dog Star', ra: hmsToRad(6, 45, 8.9), dec: dmsToRad(-16, 42, 58.0), distance: 2.64, magnitude: -1.46, spectralType: 'A1V', luminosity: 25.4, color: '#cad7ff' },
  { name: 'Sirius B', ra: hmsToRad(6, 45, 9.0), dec: dmsToRad(-16, 43, 6.0), distance: 2.64, magnitude: 8.44, spectralType: 'DA2', luminosity: 0.026, color: '#ffffff' },
  { name: 'Luyten 726-8 A', commonName: 'BL Ceti', ra: hmsToRad(1, 39, 1.3), dec: dmsToRad(-17, 57, 1.8), distance: 2.68, magnitude: 12.54, spectralType: 'M5.5Ve', luminosity: 0.00006, color: '#ffcc6f' },
  { name: 'Luyten 726-8 B', commonName: 'UV Ceti', ra: hmsToRad(1, 39, 1.3), dec: dmsToRad(-17, 57, 1.8), distance: 2.68, magnitude: 12.99, spectralType: 'M6Ve', luminosity: 0.00004, color: '#ffcc6f' },
  { name: 'Ross 154', ra: hmsToRad(18, 49, 49.4), dec: dmsToRad(-23, 50, 10.4), distance: 2.97, magnitude: 10.44, spectralType: 'M3.5Ve', luminosity: 0.0038, color: '#ffcc6f' },
  { name: 'Ross 248', ra: hmsToRad(23, 41, 54.7), dec: dmsToRad(44, 10, 30.3), distance: 3.16, magnitude: 12.29, spectralType: 'M5.5V', luminosity: 0.0018, color: '#ffcc6f' },
  { name: 'Epsilon Eridani', ra: hmsToRad(3, 32, 55.8), dec: dmsToRad(-9, 27, 29.7), distance: 3.22, magnitude: 3.73, spectralType: 'K2V', luminosity: 0.34, color: '#ffd2a1' },
  { name: 'Lacaille 9352', ra: hmsToRad(23, 5, 52.0), dec: dmsToRad(-35, 51, 11.0), distance: 3.29, magnitude: 7.34, spectralType: 'M1.5V', luminosity: 0.033, color: '#ffcc6f' },
  { name: 'Ross 128', ra: hmsToRad(11, 47, 44.4), dec: dmsToRad(0, 48, 16.4), distance: 3.37, magnitude: 11.13, spectralType: 'M4Vn', luminosity: 0.0036, color: '#ffcc6f' },
  { name: '61 Cygni A', ra: hmsToRad(21, 6, 53.9), dec: dmsToRad(38, 44, 57.9), distance: 3.48, magnitude: 5.21, spectralType: 'K5V', luminosity: 0.15, color: '#ffd2a1' },
  { name: '61 Cygni B', ra: hmsToRad(21, 6, 55.3), dec: dmsToRad(38, 44, 31.4), distance: 3.48, magnitude: 6.03, spectralType: 'K7V', luminosity: 0.085, color: '#ffd2a1' },
  { name: 'Procyon A', ra: hmsToRad(7, 39, 18.1), dec: dmsToRad(5, 13, 30.0), distance: 3.50, magnitude: 0.34, spectralType: 'F5IV-V', luminosity: 6.93, color: '#f8f7ff' },
  { name: 'Procyon B', ra: hmsToRad(7, 39, 18.1), dec: dmsToRad(5, 13, 30.0), distance: 3.50, magnitude: 10.7, spectralType: 'DQZ', luminosity: 0.00055, color: '#ffffff' },
  { name: 'Groombridge 34 A', ra: hmsToRad(0, 18, 22.9), dec: dmsToRad(44, 1, 22.6), distance: 3.56, magnitude: 8.08, spectralType: 'M1.5V', luminosity: 0.0064, color: '#ffcc6f' },
  { name: 'Groombridge 34 B', ra: hmsToRad(0, 18, 22.9), dec: dmsToRad(44, 1, 22.6), distance: 3.56, magnitude: 11.06, spectralType: 'M3.5V', luminosity: 0.0004, color: '#ffcc6f' },
  { name: 'Epsilon Indi A', ra: hmsToRad(22, 3, 21.7), dec: dmsToRad(-56, 47, 9.5), distance: 3.62, magnitude: 4.69, spectralType: 'K5V', luminosity: 0.22, color: '#ffd2a1' },
  { name: 'Tau Ceti', ra: hmsToRad(1, 44, 4.1), dec: dmsToRad(-15, 56, 14.9), distance: 3.65, magnitude: 3.50, spectralType: 'G8.5V', luminosity: 0.52, color: '#fff4e8' },
  { name: "Luyten's Star", ra: hmsToRad(7, 27, 24.5), dec: dmsToRad(5, 13, 32.8), distance: 3.72, magnitude: 9.87, spectralType: 'M3.5V', luminosity: 0.0014, color: '#ffcc6f' },
  { name: "Teegarden's Star", ra: hmsToRad(2, 53, 0.9), dec: dmsToRad(16, 52, 53.3), distance: 3.83, magnitude: 15.1, spectralType: 'M6.5V', luminosity: 0.00073, color: '#ffcc6f' },
  { name: "Kapteyn's Star", ra: hmsToRad(5, 11, 40.6), dec: dmsToRad(-45, 1, 6.3), distance: 3.91, magnitude: 8.85, spectralType: 'sdM1', luminosity: 0.012, color: '#ffcc6f' },
  { name: 'Lacaille 8760', ra: hmsToRad(21, 17, 15.3), dec: dmsToRad(-38, 52, 2.5), distance: 3.97, magnitude: 6.67, spectralType: 'M0V', luminosity: 0.029, color: '#ffcc6f' },
  { name: 'Kruger 60 A', ra: hmsToRad(22, 27, 59.5), dec: dmsToRad(57, 41, 45.1), distance: 4.01, magnitude: 9.79, spectralType: 'M3V', luminosity: 0.010, color: '#ffcc6f' },
  { name: 'Kruger 60 B', ra: hmsToRad(22, 27, 59.5), dec: dmsToRad(57, 41, 45.1), distance: 4.01, magnitude: 11.3, spectralType: 'M4V', luminosity: 0.0034, color: '#ffcc6f' },
  { name: 'Ross 614 A', ra: hmsToRad(6, 29, 23.4), dec: dmsToRad(-2, 48, 50.3), distance: 4.09, magnitude: 11.15, spectralType: 'M4.5V', luminosity: 0.0024, color: '#ffcc6f' },
  { name: 'Wolf 1061', ra: hmsToRad(16, 30, 18.1), dec: dmsToRad(-12, 39, 45.3), distance: 4.29, magnitude: 10.07, spectralType: 'M3V', luminosity: 0.0089, color: '#ffcc6f' },
  { name: "Van Maanen's Star", ra: hmsToRad(0, 49, 9.9), dec: dmsToRad(5, 23, 19.0), distance: 4.31, magnitude: 12.37, spectralType: 'DZ7', luminosity: 0.00017, color: '#ffffff' },
  { name: 'Gliese 1', ra: hmsToRad(0, 5, 24.4), dec: dmsToRad(-37, 21, 26.5), distance: 4.36, magnitude: 8.55, spectralType: 'M1.5V', luminosity: 0.022, color: '#ffcc6f' },
  { name: 'Wolf 424 A', ra: hmsToRad(12, 33, 17.2), dec: dmsToRad(9, 1, 15.8), distance: 4.37, magnitude: 13.18, spectralType: 'M5.5V', luminosity: 0.0014, color: '#ffcc6f' },
  { name: 'TZ Arietis', ra: hmsToRad(2, 0, 13.2), dec: dmsToRad(13, 3, 7.9), distance: 4.48, magnitude: 12.05, spectralType: 'M4.5V', luminosity: 0.0015, color: '#ffcc6f' },
  { name: 'Gliese 687', ra: hmsToRad(17, 36, 25.9), dec: dmsToRad(68, 20, 20.9), distance: 4.53, magnitude: 9.15, spectralType: 'M3.5V', luminosity: 0.0213, color: '#ffcc6f' },
  { name: 'LHS 292', ra: hmsToRad(10, 48, 12.6), dec: dmsToRad(-11, 20, 14.0), distance: 4.54, magnitude: 15.60, spectralType: 'M6.5V', luminosity: 0.00046, color: '#ffcc6f' },
  { name: 'Gliese 674', ra: hmsToRad(17, 28, 39.9), dec: dmsToRad(-46, 53, 42.7), distance: 4.55, magnitude: 9.38, spectralType: 'M2.5V', luminosity: 0.016, color: '#ffcc6f' },
  { name: 'GJ 1245 A', ra: hmsToRad(19, 53, 54.2), dec: dmsToRad(44, 24, 55.1), distance: 4.54, magnitude: 13.46, spectralType: 'M5.5V', luminosity: 0.0012, color: '#ffcc6f' },
  { name: 'Gliese 876', ra: hmsToRad(22, 53, 16.7), dec: dmsToRad(-14, 15, 49.3), distance: 4.69, magnitude: 10.17, spectralType: 'M4V', luminosity: 0.013, color: '#ffcc6f' },
  { name: 'Gliese 832', ra: hmsToRad(21, 33, 34.0), dec: dmsToRad(-49, 0, 32.4), distance: 4.94, magnitude: 8.66, spectralType: 'M1.5V', luminosity: 0.027, color: '#ffcc6f' },
  { name: 'Altair', commonName: 'α Aquilae', ra: hmsToRad(19, 50, 47.0), dec: dmsToRad(8, 52, 5.9), distance: 5.13, magnitude: 0.76, spectralType: 'A7V', luminosity: 10.6, color: '#f8f7ff' },
  { name: 'EV Lacertae', ra: hmsToRad(22, 46, 49.7), dec: dmsToRad(44, 20, 2.4), distance: 5.05, magnitude: 10.06, spectralType: 'M3.5Ve', luminosity: 0.013, color: '#ffcc6f' },
  { name: '70 Ophiuchi A', ra: hmsToRad(18, 5, 27.3), dec: dmsToRad(2, 30, 0.4), distance: 5.09, magnitude: 4.03, spectralType: 'K0V', luminosity: 0.43, color: '#ffd2a1' },
  { name: '70 Ophiuchi B', ra: hmsToRad(18, 5, 27.3), dec: dmsToRad(2, 30, 0.4), distance: 5.09, magnitude: 6.00, spectralType: 'K4V', luminosity: 0.077, color: '#ffd2a1' },
  { name: '36 Ophiuchi A', ra: hmsToRad(17, 15, 20.8), dec: dmsToRad(-26, 36, 9.0), distance: 5.99, magnitude: 5.07, spectralType: 'K0V', luminosity: 0.28, color: '#ffd2a1' },
  { name: '36 Ophiuchi B', ra: hmsToRad(17, 15, 21.0), dec: dmsToRad(-26, 36, 10.0), distance: 5.99, magnitude: 5.11, spectralType: 'K1V', luminosity: 0.27, color: '#ffd2a1' },
  { name: 'HR 7703', ra: hmsToRad(20, 11, 11.9), dec: dmsToRad(-36, 6, 4.3), distance: 5.94, magnitude: 5.31, spectralType: 'K3V', luminosity: 0.21, color: '#ffd2a1' },
  { name: 'Sigma Draconis', ra: hmsToRad(19, 32, 21.6), dec: dmsToRad(69, 39, 40.2), distance: 5.77, magnitude: 4.68, spectralType: 'G9V', luminosity: 0.43, color: '#fff4e8' },
  { name: 'Eta Cassiopeiae A', ra: hmsToRad(0, 49, 6.3), dec: dmsToRad(57, 48, 54.7), distance: 5.95, magnitude: 3.44, spectralType: 'G3V', luminosity: 1.23, color: '#fff4e8' },
  { name: '82 Eridani', ra: hmsToRad(3, 19, 55.7), dec: dmsToRad(-43, 4, 11.2), distance: 6.04, magnitude: 4.26, spectralType: 'G8V', luminosity: 0.70, color: '#fff4e8' },
  { name: 'Delta Pavonis', ra: hmsToRad(20, 8, 43.6), dec: dmsToRad(-66, 10, 55.4), distance: 6.11, magnitude: 3.55, spectralType: 'G8IV', luminosity: 1.22, color: '#fff4e8' },
  { name: 'Gliese 570 A', ra: hmsToRad(14, 57, 28.0), dec: dmsToRad(-21, 24, 55.7), distance: 5.84, magnitude: 5.64, spectralType: 'K4V', luminosity: 0.155, color: '#ffd2a1' },
  { name: 'HR 8832', ra: hmsToRad(23, 13, 16.5), dec: dmsToRad(57, 10, 6.1), distance: 6.39, magnitude: 5.57, spectralType: 'K3V', luminosity: 0.21, color: '#ffd2a1' },
  { name: 'Xi Bootis A', ra: hmsToRad(14, 51, 23.4), dec: dmsToRad(19, 6, 1.7), distance: 6.70, magnitude: 4.54, spectralType: 'G8Ve', luminosity: 0.49, color: '#fff4e8' },
  { name: 'Mu Cassiopeiae A', ra: hmsToRad(1, 8, 16.4), dec: dmsToRad(54, 55, 13.2), distance: 7.59, magnitude: 5.17, spectralType: 'G5Vb', luminosity: 0.39, color: '#fff4e8' },
  { name: 'Beta Comae Berenices', ra: hmsToRad(13, 11, 52.4), dec: dmsToRad(27, 52, 41.5), distance: 9.16, magnitude: 4.26, spectralType: 'G0V', luminosity: 1.36, color: '#fff4e8' },
  { name: 'Kappa Ceti', ra: hmsToRad(3, 19, 21.7), dec: dmsToRad(3, 22, 12.7), distance: 9.16, magnitude: 4.84, spectralType: 'G5V', luminosity: 0.85, color: '#fff4e8' },
  { name: 'Gamma Leporis A', ra: hmsToRad(5, 44, 27.8), dec: dmsToRad(-22, 26, 54.2), distance: 8.97, magnitude: 3.59, spectralType: 'F6V', luminosity: 2.29, color: '#f8f7ff' },
  { name: 'Zeta Tucanae', ra: hmsToRad(0, 20, 4.3), dec: dmsToRad(-64, 52, 29.2), distance: 8.59, magnitude: 4.23, spectralType: 'F9.5V', luminosity: 1.26, color: '#f8f7ff' },
  { name: 'Chi1 Orionis A', ra: hmsToRad(5, 54, 23.0), dec: dmsToRad(20, 16, 34.2), distance: 8.66, magnitude: 4.39, spectralType: 'G0V', luminosity: 1.04, color: '#fff4e8' },
];

// ===== BRIGHT STARS (notable stars visible to naked eye) =====
export const BRIGHT_STARS: Star[] = [
  // First magnitude stars and notable navigation stars
  { name: 'Vega', commonName: 'α Lyrae', ra: hmsToRad(18, 36, 56.3), dec: dmsToRad(38, 47, 1.3), distance: 7.68, magnitude: 0.03, spectralType: 'A0V', luminosity: 40.12, color: '#cad7ff' },
  { name: 'Arcturus', commonName: 'α Boötis', ra: hmsToRad(14, 15, 39.7), dec: dmsToRad(19, 10, 56.7), distance: 11.26, magnitude: -0.05, spectralType: 'K1.5III', luminosity: 170, color: '#ffcc6f' },
  { name: 'Capella', commonName: 'α Aurigae', ra: hmsToRad(5, 16, 41.4), dec: dmsToRad(45, 59, 52.8), distance: 12.94, magnitude: 0.08, spectralType: 'G3III', luminosity: 78.7, color: '#fff4e8' },
  { name: 'Rigel', commonName: 'β Orionis', ra: hmsToRad(5, 14, 32.3), dec: dmsToRad(-8, 12, 5.9), distance: 264, magnitude: 0.13, spectralType: 'B8Ia', luminosity: 120000, color: '#aabfff' },
  { name: 'Betelgeuse', commonName: 'α Orionis', ra: hmsToRad(5, 55, 10.3), dec: dmsToRad(7, 24, 25.4), distance: 222, magnitude: 0.42, spectralType: 'M1-2Ia-ab', luminosity: 126000, color: '#ff8c42' },
  { name: 'Aldebaran', commonName: 'α Tauri', ra: hmsToRad(4, 35, 55.2), dec: dmsToRad(16, 30, 33.5), distance: 20.0, magnitude: 0.85, spectralType: 'K5III', luminosity: 518, color: '#ffc56c' },
  { name: 'Spica', commonName: 'α Virginis', ra: hmsToRad(13, 25, 11.6), dec: dmsToRad(-11, 9, 40.8), distance: 77.0, magnitude: 0.97, spectralType: 'B1V', luminosity: 12100, color: '#aabfff' },
  { name: 'Antares', commonName: 'α Scorpii', ra: hmsToRad(16, 29, 24.5), dec: dmsToRad(-26, 25, 55.2), distance: 170, magnitude: 1.06, spectralType: 'M1.5Iab-b', luminosity: 75900, color: '#ff8c42' },
  { name: 'Pollux', commonName: 'β Geminorum', ra: hmsToRad(7, 45, 18.9), dec: dmsToRad(28, 1, 34.3), distance: 10.36, magnitude: 1.14, spectralType: 'K0III', luminosity: 32.7, color: '#ffd2a1' },
  { name: 'Fomalhaut', commonName: 'α Piscis Austrini', ra: hmsToRad(22, 57, 39.0), dec: dmsToRad(-29, 37, 20.1), distance: 7.70, magnitude: 1.16, spectralType: 'A3V', luminosity: 16.63, color: '#f8f7ff' },
  { name: 'Deneb', commonName: 'α Cygni', ra: hmsToRad(20, 41, 25.9), dec: dmsToRad(45, 16, 49.2), distance: 802, magnitude: 1.25, spectralType: 'A2Ia', luminosity: 196000, color: '#f8f7ff' },
  { name: 'Regulus', commonName: 'α Leonis', ra: hmsToRad(10, 8, 22.3), dec: dmsToRad(11, 58, 1.9), distance: 24.3, magnitude: 1.35, spectralType: 'B7V', luminosity: 288, color: '#aabfff' },
  { name: 'Castor', commonName: 'α Geminorum', ra: hmsToRad(7, 34, 36.0), dec: dmsToRad(31, 53, 17.8), distance: 15.8, magnitude: 1.58, spectralType: 'A1V', luminosity: 52.4, color: '#f8f7ff' },
  { name: 'Polaris', commonName: 'α Ursae Minoris', ra: hmsToRad(2, 31, 49.1), dec: dmsToRad(89, 15, 50.8), distance: 132, magnitude: 1.98, spectralType: 'F7Ib', luminosity: 1260, color: '#fff4e8' },
  { name: 'Achernar', commonName: 'α Eridani', ra: hmsToRad(1, 37, 42.8), dec: dmsToRad(-57, 14, 12.3), distance: 42.8, magnitude: 0.46, spectralType: 'B3Vpe', luminosity: 3150, color: '#aabfff' },
  { name: 'Hadar', commonName: 'β Centauri', ra: hmsToRad(14, 3, 49.4), dec: dmsToRad(-60, 22, 22.9), distance: 161, magnitude: 0.61, spectralType: 'B1III', luminosity: 41700, color: '#aabfff' },
  { name: 'Acrux', commonName: 'α Crucis', ra: hmsToRad(12, 26, 35.9), dec: dmsToRad(-63, 5, 56.7), distance: 99, magnitude: 0.76, spectralType: 'B0.5IV', luminosity: 25000, color: '#9bb0ff' },
  { name: 'Mimosa', commonName: 'β Crucis', ra: hmsToRad(12, 47, 43.3), dec: dmsToRad(-59, 41, 19.6), distance: 85, magnitude: 1.25, spectralType: 'B0.5III', luminosity: 34000, color: '#9bb0ff' },
  { name: 'Canopus', commonName: 'α Carinae', ra: hmsToRad(6, 23, 57.1), dec: dmsToRad(-52, 41, 44.4), distance: 95, magnitude: -0.74, spectralType: 'A9II', luminosity: 10700, color: '#f8f7ff' },
  { name: 'Alnilam', commonName: 'ε Orionis', ra: hmsToRad(5, 36, 12.8), dec: dmsToRad(-1, 12, 6.9), distance: 606, magnitude: 1.69, spectralType: 'B0Ia', luminosity: 275000, color: '#9bb0ff' },
  { name: 'Alnitak', commonName: 'ζ Orionis', ra: hmsToRad(5, 40, 45.5), dec: dmsToRad(-1, 56, 33.3), distance: 226, magnitude: 1.74, spectralType: 'O9.5Ib', luminosity: 250000, color: '#9bb0ff' },
  { name: 'Mintaka', commonName: 'δ Orionis', ra: hmsToRad(5, 32, 0.4), dec: dmsToRad(-0, 17, 56.7), distance: 212, magnitude: 2.23, spectralType: 'O9.5II', luminosity: 190000, color: '#9bb0ff' },
  { name: 'Bellatrix', commonName: 'γ Orionis', ra: hmsToRad(5, 25, 7.9), dec: dmsToRad(6, 20, 58.9), distance: 77.3, magnitude: 1.64, spectralType: 'B2III', luminosity: 9211, color: '#aabfff' },
  { name: 'Saiph', commonName: 'κ Orionis', ra: hmsToRad(5, 47, 45.4), dec: dmsToRad(-9, 40, 10.6), distance: 220, magnitude: 2.09, spectralType: 'B0.5Ia', luminosity: 56881, color: '#9bb0ff' },
  { name: 'Dubhe', commonName: 'α Ursae Majoris', ra: hmsToRad(11, 3, 43.7), dec: dmsToRad(61, 45, 3.7), distance: 37.4, magnitude: 1.79, spectralType: 'K0III', luminosity: 316, color: '#ffd2a1' },
  { name: 'Merak', commonName: 'β Ursae Majoris', ra: hmsToRad(11, 1, 50.5), dec: dmsToRad(56, 22, 56.7), distance: 24.4, magnitude: 2.37, spectralType: 'A1V', luminosity: 63.0, color: '#cad7ff' },
  { name: 'Phecda', commonName: 'γ Ursae Majoris', ra: hmsToRad(11, 53, 49.8), dec: dmsToRad(53, 41, 41.1), distance: 25.6, magnitude: 2.44, spectralType: 'A0Ve', luminosity: 65.3, color: '#cad7ff' },
  { name: 'Megrez', commonName: 'δ Ursae Majoris', ra: hmsToRad(12, 15, 25.6), dec: dmsToRad(57, 1, 57.4), distance: 24.9, magnitude: 3.31, spectralType: 'A3V', luminosity: 14.0, color: '#cad7ff' },
  { name: 'Alioth', commonName: 'ε Ursae Majoris', ra: hmsToRad(12, 54, 1.7), dec: dmsToRad(55, 57, 35.4), distance: 25.0, magnitude: 1.77, spectralType: 'A0pCr', luminosity: 102, color: '#cad7ff' },
  { name: 'Mizar', commonName: 'ζ Ursae Majoris', ra: hmsToRad(13, 23, 55.5), dec: dmsToRad(54, 55, 31.3), distance: 24.0, magnitude: 2.27, spectralType: 'A2V', luminosity: 71.0, color: '#cad7ff' },
  { name: 'Alkaid', commonName: 'η Ursae Majoris', ra: hmsToRad(13, 47, 32.4), dec: dmsToRad(49, 18, 48.0), distance: 31.2, magnitude: 1.86, spectralType: 'B3V', luminosity: 594, color: '#aabfff' },
  { name: 'Schedar', commonName: 'α Cassiopeiae', ra: hmsToRad(0, 40, 30.4), dec: dmsToRad(56, 32, 14.4), distance: 70.0, magnitude: 2.24, spectralType: 'K0IIIa', luminosity: 855, color: '#ffd2a1' },
  { name: 'Caph', commonName: 'β Cassiopeiae', ra: hmsToRad(0, 9, 10.7), dec: dmsToRad(59, 8, 59.2), distance: 16.8, magnitude: 2.27, spectralType: 'F2III', luminosity: 27.3, color: '#f8f7ff' },
  { name: 'Ruchbah', commonName: 'δ Cassiopeiae', ra: hmsToRad(1, 25, 49.0), dec: dmsToRad(60, 14, 7.0), distance: 30.8, magnitude: 2.68, spectralType: 'A5III-IVv', luminosity: 63.0, color: '#cad7ff' },
  { name: 'Alpheratz', commonName: 'α Andromedae', ra: hmsToRad(0, 8, 23.3), dec: dmsToRad(29, 5, 25.6), distance: 29.7, magnitude: 2.06, spectralType: 'B8IVpMnHg', luminosity: 200, color: '#aabfff' },
  { name: 'Mirach', commonName: 'β Andromedae', ra: hmsToRad(1, 9, 43.9), dec: dmsToRad(35, 37, 14.0), distance: 60.0, magnitude: 2.05, spectralType: 'M0III', luminosity: 1995, color: '#ff8c42' },
  { name: 'Almach', commonName: 'γ Andromedae', ra: hmsToRad(2, 3, 54.0), dec: dmsToRad(42, 19, 47.0), distance: 109, magnitude: 2.10, spectralType: 'K3IIb', luminosity: 2000, color: '#ffd2a1' },
  { name: 'Hamal', commonName: 'α Arietis', ra: hmsToRad(2, 7, 10.4), dec: dmsToRad(23, 27, 44.7), distance: 20.2, magnitude: 2.00, spectralType: 'K2III', luminosity: 91, color: '#ffd2a1' },
  { name: 'Sheratan', commonName: 'β Arietis', ra: hmsToRad(1, 54, 38.4), dec: dmsToRad(20, 48, 28.9), distance: 18.0, magnitude: 2.64, spectralType: 'A5V', luminosity: 17.1, color: '#cad7ff' },
  { name: 'Diphda', commonName: 'β Ceti', ra: hmsToRad(0, 43, 35.4), dec: dmsToRad(-17, 59, 11.8), distance: 29.5, magnitude: 2.04, spectralType: 'K0III', luminosity: 145, color: '#ffd2a1' },
  { name: 'Mira', commonName: 'ο Ceti', ra: hmsToRad(2, 19, 20.8), dec: dmsToRad(-2, 58, 39.5), distance: 92, magnitude: 3.04, spectralType: 'M7IIIe', luminosity: 8400, color: '#ff8c42' },
  { name: 'Algol', commonName: 'β Persei', ra: hmsToRad(3, 8, 10.1), dec: dmsToRad(40, 57, 20.3), distance: 28.5, magnitude: 2.12, spectralType: 'B8V', luminosity: 98, color: '#aabfff' },
  { name: 'Mirfak', commonName: 'α Persei', ra: hmsToRad(3, 24, 19.4), dec: dmsToRad(49, 51, 40.2), distance: 156, magnitude: 1.79, spectralType: 'F5Ib', luminosity: 5000, color: '#f8f7ff' },
  { name: 'Alhena', commonName: 'γ Geminorum', ra: hmsToRad(6, 37, 42.7), dec: dmsToRad(16, 23, 57.4), distance: 33.4, magnitude: 1.93, spectralType: 'A1.5IV+', luminosity: 123, color: '#cad7ff' },
  { name: 'Elnath', commonName: 'β Tauri', ra: hmsToRad(5, 26, 17.5), dec: dmsToRad(28, 36, 26.8), distance: 40.2, magnitude: 1.65, spectralType: 'B7III', luminosity: 700, color: '#aabfff' },
  { name: 'Wezen', commonName: 'δ Canis Majoris', ra: hmsToRad(7, 8, 23.5), dec: dmsToRad(-26, 23, 35.5), distance: 490, magnitude: 1.84, spectralType: 'F8Ia', luminosity: 50000, color: '#fff4e8' },
  { name: 'Adhara', commonName: 'ε Canis Majoris', ra: hmsToRad(6, 58, 37.5), dec: dmsToRad(-28, 58, 19.5), distance: 132, magnitude: 1.50, spectralType: 'B2Iab', luminosity: 38700, color: '#aabfff' },
  { name: 'Mirzam', commonName: 'β Canis Majoris', ra: hmsToRad(6, 22, 41.9), dec: dmsToRad(-17, 57, 21.3), distance: 152, magnitude: 1.98, spectralType: 'B1II-III', luminosity: 26600, color: '#9bb0ff' },
  { name: 'Aludra', commonName: 'η Canis Majoris', ra: hmsToRad(7, 24, 5.7), dec: dmsToRad(-29, 18, 11.2), distance: 611, magnitude: 2.45, spectralType: 'B5Ia', luminosity: 66000, color: '#aabfff' },
  { name: 'Naos', commonName: 'ζ Puppis', ra: hmsToRad(8, 3, 35.0), dec: dmsToRad(-40, 0, 11.3), distance: 460, magnitude: 2.25, spectralType: 'O5Iaf', luminosity: 550000, color: '#9bb0ff' },
  { name: 'Alphard', commonName: 'α Hydrae', ra: hmsToRad(9, 27, 35.2), dec: dmsToRad(-8, 39, 30.6), distance: 54.0, magnitude: 2.00, spectralType: 'K3III', luminosity: 780, color: '#ffd2a1' },
  { name: 'Denebola', commonName: 'β Leonis', ra: hmsToRad(11, 49, 3.6), dec: dmsToRad(14, 34, 19.4), distance: 11.0, magnitude: 2.14, spectralType: 'A3V', luminosity: 15, color: '#cad7ff' },
  { name: 'Cor Caroli', commonName: 'α Canum Venaticorum', ra: hmsToRad(12, 56, 1.7), dec: dmsToRad(38, 19, 6.2), distance: 33.8, magnitude: 2.90, spectralType: 'A0pSiEuHg', luminosity: 83, color: '#cad7ff' },
  { name: 'Vindemiatrix', commonName: 'ε Virginis', ra: hmsToRad(13, 2, 10.6), dec: dmsToRad(10, 57, 32.9), distance: 31.0, magnitude: 2.83, spectralType: 'G8IIIab', luminosity: 77, color: '#fff4e8' },
  { name: 'Zubenelgenubi', commonName: 'α Librae', ra: hmsToRad(14, 50, 52.7), dec: dmsToRad(-16, 2, 30.4), distance: 23.2, magnitude: 2.75, spectralType: 'A3IV', luminosity: 33, color: '#cad7ff' },
  { name: 'Zubeneschamali', commonName: 'β Librae', ra: hmsToRad(15, 17, 0.4), dec: dmsToRad(-9, 22, 58.5), distance: 56.0, magnitude: 2.61, spectralType: 'B8V', luminosity: 130, color: '#aabfff' },
  { name: 'Unukalhai', commonName: 'α Serpentis', ra: hmsToRad(15, 44, 16.1), dec: dmsToRad(6, 25, 32.3), distance: 22.7, magnitude: 2.65, spectralType: 'K2III', luminosity: 70, color: '#ffd2a1' },
  { name: 'Kornephoros', commonName: 'β Herculis', ra: hmsToRad(16, 30, 13.2), dec: dmsToRad(21, 29, 22.6), distance: 45.0, magnitude: 2.78, spectralType: 'G7IIIa', luminosity: 175, color: '#fff4e8' },
  { name: 'Rasalgethi', commonName: 'α Herculis', ra: hmsToRad(17, 14, 38.9), dec: dmsToRad(14, 23, 25.2), distance: 110, magnitude: 3.35, spectralType: 'M5Ib-II', luminosity: 17000, color: '#ff8c42' },
  { name: 'Rasalhague', commonName: 'α Ophiuchi', ra: hmsToRad(17, 34, 56.1), dec: dmsToRad(12, 33, 36.1), distance: 14.3, magnitude: 2.08, spectralType: 'A5III', luminosity: 25.1, color: '#cad7ff' },
  { name: 'Shaula', commonName: 'λ Scorpii', ra: hmsToRad(17, 33, 36.5), dec: dmsToRad(-37, 6, 13.8), distance: 214, magnitude: 1.62, spectralType: 'B1.5IV', luminosity: 36300, color: '#9bb0ff' },
  { name: 'Lesath', commonName: 'υ Scorpii', ra: hmsToRad(17, 30, 45.8), dec: dmsToRad(-37, 17, 44.9), distance: 175, magnitude: 2.70, spectralType: 'B2IV', luminosity: 12300, color: '#aabfff' },
  { name: 'Sargas', commonName: 'θ Scorpii', ra: hmsToRad(17, 37, 19.1), dec: dmsToRad(-42, 59, 52.2), distance: 82, magnitude: 1.87, spectralType: 'F1II', luminosity: 1834, color: '#f8f7ff' },
  { name: 'Kaus Australis', commonName: 'ε Sagittarii', ra: hmsToRad(18, 24, 10.3), dec: dmsToRad(-34, 23, 4.6), distance: 44.5, magnitude: 1.85, spectralType: 'B9.5III', luminosity: 375, color: '#aabfff' },
  { name: 'Nunki', commonName: 'σ Sagittarii', ra: hmsToRad(18, 55, 15.9), dec: dmsToRad(-26, 17, 48.2), distance: 68.0, magnitude: 2.05, spectralType: 'B2.5V', luminosity: 3300, color: '#aabfff' },
  { name: 'Sadr', commonName: 'γ Cygni', ra: hmsToRad(20, 22, 13.7), dec: dmsToRad(40, 15, 24.0), distance: 560, magnitude: 2.23, spectralType: 'F8Ib', luminosity: 33000, color: '#fff4e8' },
  { name: 'Albireo', commonName: 'β Cygni', ra: hmsToRad(19, 30, 43.3), dec: dmsToRad(27, 57, 34.8), distance: 130, magnitude: 3.05, spectralType: 'K3II', luminosity: 1200, color: '#ffd2a1' },
  { name: 'Enif', commonName: 'ε Pegasi', ra: hmsToRad(21, 44, 11.2), dec: dmsToRad(9, 52, 30.0), distance: 211, magnitude: 2.38, spectralType: 'K2Ib', luminosity: 12250, color: '#ffd2a1' },
  { name: 'Scheat', commonName: 'β Pegasi', ra: hmsToRad(23, 3, 46.5), dec: dmsToRad(28, 4, 58.0), distance: 60.4, magnitude: 2.42, spectralType: 'M2.5II-III', luminosity: 1500, color: '#ff8c42' },
  { name: 'Markab', commonName: 'α Pegasi', ra: hmsToRad(23, 4, 45.7), dec: dmsToRad(15, 12, 18.9), distance: 42.4, magnitude: 2.49, spectralType: 'B9III', luminosity: 205, color: '#aabfff' },
  { name: 'Algenib', commonName: 'γ Pegasi', ra: hmsToRad(0, 13, 14.2), dec: dmsToRad(15, 11, 0.9), distance: 109, magnitude: 2.83, spectralType: 'B2IV', luminosity: 5840, color: '#aabfff' },
  { name: 'Ankaa', commonName: 'α Phoenicis', ra: hmsToRad(0, 26, 17.1), dec: dmsToRad(-42, 18, 21.5), distance: 25.7, magnitude: 2.39, spectralType: 'K0III', luminosity: 83, color: '#ffd2a1' },
  { name: 'Peacock', commonName: 'α Pavonis', ra: hmsToRad(20, 25, 38.9), dec: dmsToRad(-56, 44, 6.3), distance: 55.6, magnitude: 1.91, spectralType: 'B2IV', luminosity: 2200, color: '#aabfff' },
  { name: 'Alnair', commonName: 'α Gruis', ra: hmsToRad(22, 8, 14.0), dec: dmsToRad(-46, 57, 39.5), distance: 31.1, magnitude: 1.74, spectralType: 'B6V', luminosity: 380, color: '#aabfff' },
  { name: 'Formalhaut', commonName: 'α Piscis Austrini', ra: hmsToRad(22, 57, 39.0), dec: dmsToRad(-29, 37, 20.1), distance: 7.70, magnitude: 1.16, spectralType: 'A3V', luminosity: 16.63, color: '#f8f7ff' },
];

// ===== ADDITIONAL CATALOG STARS (Hipparcos/Gaia data) =====
export const CATALOG_STARS: Star[] = [
  // More stars from various constellations
  { name: 'Menkalinan', commonName: 'β Aurigae', ra: hmsToRad(5, 59, 31.7), dec: dmsToRad(44, 56, 50.8), distance: 25.0, magnitude: 1.90, spectralType: 'A1mIV', luminosity: 80, color: '#cad7ff' },
  { name: 'Menkent', commonName: 'θ Centauri', ra: hmsToRad(14, 6, 40.9), dec: dmsToRad(-36, 22, 11.8), distance: 18.0, magnitude: 2.06, spectralType: 'K0III', luminosity: 61, color: '#ffd2a1' },
  { name: 'Atria', commonName: 'α Trianguli Australis', ra: hmsToRad(16, 48, 39.9), dec: dmsToRad(-69, 1, 39.8), distance: 124, magnitude: 1.92, spectralType: 'K2IIb-IIIa', luminosity: 5500, color: '#ffd2a1' },
  { name: 'Gacrux', commonName: 'γ Crucis', ra: hmsToRad(12, 31, 9.9), dec: dmsToRad(-57, 6, 47.6), distance: 27.0, magnitude: 1.63, spectralType: 'M3.5III', luminosity: 820, color: '#ff8c42' },
  { name: 'Eltanin', commonName: 'γ Draconis', ra: hmsToRad(17, 56, 36.4), dec: dmsToRad(51, 29, 20.0), distance: 47.3, magnitude: 2.24, spectralType: 'K5III', luminosity: 600, color: '#ffd2a1' },
  { name: 'Thuban', commonName: 'α Draconis', ra: hmsToRad(14, 4, 23.4), dec: dmsToRad(64, 22, 33.1), distance: 92.3, magnitude: 3.65, spectralType: 'A0III', luminosity: 250, color: '#cad7ff' },
  { name: 'Kochab', commonName: 'β Ursae Minoris', ra: hmsToRad(14, 50, 42.3), dec: dmsToRad(74, 9, 19.8), distance: 40.0, magnitude: 2.08, spectralType: 'K4III', luminosity: 390, color: '#ffd2a1' },
  { name: 'Pherkad', commonName: 'γ Ursae Minoris', ra: hmsToRad(15, 20, 43.7), dec: dmsToRad(71, 50, 2.5), distance: 148, magnitude: 3.05, spectralType: 'A3II-III', luminosity: 1100, color: '#cad7ff' },
  { name: 'Muscida', commonName: 'ο Ursae Majoris', ra: hmsToRad(8, 30, 15.9), dec: dmsToRad(60, 43, 5.4), distance: 56.0, magnitude: 3.36, spectralType: 'G4II-III', luminosity: 138, color: '#fff4e8' },
  { name: 'Tania Borealis', commonName: 'λ Ursae Majoris', ra: hmsToRad(10, 17, 5.8), dec: dmsToRad(42, 54, 51.7), distance: 42.0, magnitude: 3.45, spectralType: 'A2IV', luminosity: 37, color: '#cad7ff' },
  { name: 'Tania Australis', commonName: 'μ Ursae Majoris', ra: hmsToRad(10, 22, 19.7), dec: dmsToRad(41, 29, 58.3), distance: 75.0, magnitude: 3.05, spectralType: 'M0III', luminosity: 750, color: '#ff8c42' },
  { name: 'Alula Borealis', commonName: 'ν Ursae Majoris', ra: hmsToRad(11, 18, 28.7), dec: dmsToRad(33, 5, 39.5), distance: 127, magnitude: 3.49, spectralType: 'K3III', luminosity: 775, color: '#ffd2a1' },
  { name: 'Alula Australis', commonName: 'ξ Ursae Majoris', ra: hmsToRad(11, 18, 11.0), dec: dmsToRad(31, 31, 44.9), distance: 8.73, magnitude: 4.32, spectralType: 'G0V', luminosity: 1.07, color: '#fff4e8' },
  { name: 'Navi', commonName: 'γ Cassiopeiae', ra: hmsToRad(0, 56, 42.5), dec: dmsToRad(60, 43, 0.3), distance: 188, magnitude: 2.47, spectralType: 'B0.5IVe', luminosity: 34000, color: '#9bb0ff' },
  { name: 'Segin', commonName: 'ε Cassiopeiae', ra: hmsToRad(1, 54, 23.7), dec: dmsToRad(63, 40, 12.4), distance: 135, magnitude: 3.38, spectralType: 'B3III', luminosity: 2500, color: '#aabfff' },
  { name: 'Achird', commonName: 'η Cassiopeiae', ra: hmsToRad(0, 49, 6.3), dec: dmsToRad(57, 48, 54.7), distance: 5.95, magnitude: 3.44, spectralType: 'G0V', luminosity: 1.29, color: '#fff4e8' },
  { name: 'Caph', commonName: 'β Cassiopeiae', ra: hmsToRad(0, 9, 10.7), dec: dmsToRad(59, 8, 59.2), distance: 16.8, magnitude: 2.27, spectralType: 'F2III', luminosity: 27.3, color: '#f8f7ff' },
  { name: 'Tsih', commonName: 'γ Cassiopeiae', ra: hmsToRad(0, 56, 42.5), dec: dmsToRad(60, 43, 0.3), distance: 188, magnitude: 2.47, spectralType: 'B0IVe', luminosity: 34000, color: '#9bb0ff' },
  { name: 'Tegmine', commonName: 'ζ Cancri', ra: hmsToRad(8, 12, 12.7), dec: dmsToRad(17, 38, 52.4), distance: 25.0, magnitude: 4.67, spectralType: 'F8V', luminosity: 2.12, color: '#f8f7ff' },
  { name: 'Acubens', commonName: 'α Cancri', ra: hmsToRad(8, 58, 29.2), dec: dmsToRad(11, 51, 27.7), distance: 53.0, magnitude: 4.26, spectralType: 'A5m', luminosity: 23, color: '#cad7ff' },
  { name: 'Asellus Borealis', commonName: 'γ Cancri', ra: hmsToRad(8, 43, 17.1), dec: dmsToRad(21, 28, 6.6), distance: 55.0, magnitude: 4.66, spectralType: 'A1IV', luminosity: 35, color: '#cad7ff' },
  { name: 'Asellus Australis', commonName: 'δ Cancri', ra: hmsToRad(8, 44, 41.1), dec: dmsToRad(18, 9, 15.5), distance: 40.0, magnitude: 3.94, spectralType: 'K0III', luminosity: 53, color: '#ffd2a1' },
];

// Combine all stars
export const ALL_STARS: Star[] = [...NEARBY_STARS, ...BRIGHT_STARS, ...CATALOG_STARS];

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
