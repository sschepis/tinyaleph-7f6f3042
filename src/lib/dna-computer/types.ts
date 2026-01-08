// DNA Computer Types and Constants

export const DNA_ALPHABET = [
  { nucleotide: 'A', prime: 2, complement: 'T', type: 'purine', color: '#22c55e' },
  { nucleotide: 'T', prime: 3, complement: 'A', type: 'pyrimidine', color: '#ef4444' },
  { nucleotide: 'G', prime: 5, complement: 'C', type: 'purine', color: '#eab308' },
  { nucleotide: 'C', prime: 7, complement: 'G', type: 'pyrimidine', color: '#3b82f6' },
] as const;

export const NUCLEOTIDE_PRIMES: Record<string, number> = {
  A: 2,
  T: 3,
  G: 5,
  C: 7,
};

export const COMPLEMENT_MAP: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

export const NUCLEOTIDE_COLORS: Record<string, string> = {
  A: '#22c55e', // Green
  T: '#ef4444', // Red
  G: '#eab308', // Yellow
  C: '#3b82f6', // Blue
};

// Standard genetic code: codon -> amino acid
export const GENETIC_CODE: Record<string, { aminoAcid: string; abbrev: string; property: string }> = {
  // Phenylalanine
  'TTT': { aminoAcid: 'Phenylalanine', abbrev: 'Phe', property: 'hydrophobic' },
  'TTC': { aminoAcid: 'Phenylalanine', abbrev: 'Phe', property: 'hydrophobic' },
  // Leucine
  'TTA': { aminoAcid: 'Leucine', abbrev: 'Leu', property: 'hydrophobic' },
  'TTG': { aminoAcid: 'Leucine', abbrev: 'Leu', property: 'hydrophobic' },
  'CTT': { aminoAcid: 'Leucine', abbrev: 'Leu', property: 'hydrophobic' },
  'CTC': { aminoAcid: 'Leucine', abbrev: 'Leu', property: 'hydrophobic' },
  'CTA': { aminoAcid: 'Leucine', abbrev: 'Leu', property: 'hydrophobic' },
  'CTG': { aminoAcid: 'Leucine', abbrev: 'Leu', property: 'hydrophobic' },
  // Isoleucine
  'ATT': { aminoAcid: 'Isoleucine', abbrev: 'Ile', property: 'hydrophobic' },
  'ATC': { aminoAcid: 'Isoleucine', abbrev: 'Ile', property: 'hydrophobic' },
  'ATA': { aminoAcid: 'Isoleucine', abbrev: 'Ile', property: 'hydrophobic' },
  // Methionine (Start)
  'ATG': { aminoAcid: 'Methionine', abbrev: 'Met', property: 'start' },
  // Valine
  'GTT': { aminoAcid: 'Valine', abbrev: 'Val', property: 'hydrophobic' },
  'GTC': { aminoAcid: 'Valine', abbrev: 'Val', property: 'hydrophobic' },
  'GTA': { aminoAcid: 'Valine', abbrev: 'Val', property: 'hydrophobic' },
  'GTG': { aminoAcid: 'Valine', abbrev: 'Val', property: 'hydrophobic' },
  // Serine
  'TCT': { aminoAcid: 'Serine', abbrev: 'Ser', property: 'polar' },
  'TCC': { aminoAcid: 'Serine', abbrev: 'Ser', property: 'polar' },
  'TCA': { aminoAcid: 'Serine', abbrev: 'Ser', property: 'polar' },
  'TCG': { aminoAcid: 'Serine', abbrev: 'Ser', property: 'polar' },
  'AGT': { aminoAcid: 'Serine', abbrev: 'Ser', property: 'polar' },
  'AGC': { aminoAcid: 'Serine', abbrev: 'Ser', property: 'polar' },
  // Proline
  'CCT': { aminoAcid: 'Proline', abbrev: 'Pro', property: 'hydrophobic' },
  'CCC': { aminoAcid: 'Proline', abbrev: 'Pro', property: 'hydrophobic' },
  'CCA': { aminoAcid: 'Proline', abbrev: 'Pro', property: 'hydrophobic' },
  'CCG': { aminoAcid: 'Proline', abbrev: 'Pro', property: 'hydrophobic' },
  // Threonine
  'ACT': { aminoAcid: 'Threonine', abbrev: 'Thr', property: 'polar' },
  'ACC': { aminoAcid: 'Threonine', abbrev: 'Thr', property: 'polar' },
  'ACA': { aminoAcid: 'Threonine', abbrev: 'Thr', property: 'polar' },
  'ACG': { aminoAcid: 'Threonine', abbrev: 'Thr', property: 'polar' },
  // Alanine
  'GCT': { aminoAcid: 'Alanine', abbrev: 'Ala', property: 'hydrophobic' },
  'GCC': { aminoAcid: 'Alanine', abbrev: 'Ala', property: 'hydrophobic' },
  'GCA': { aminoAcid: 'Alanine', abbrev: 'Ala', property: 'hydrophobic' },
  'GCG': { aminoAcid: 'Alanine', abbrev: 'Ala', property: 'hydrophobic' },
  // Tyrosine
  'TAT': { aminoAcid: 'Tyrosine', abbrev: 'Tyr', property: 'polar' },
  'TAC': { aminoAcid: 'Tyrosine', abbrev: 'Tyr', property: 'polar' },
  // Stop codons
  'TAA': { aminoAcid: 'Stop', abbrev: 'Stop', property: 'stop' },
  'TAG': { aminoAcid: 'Stop', abbrev: 'Stop', property: 'stop' },
  'TGA': { aminoAcid: 'Stop', abbrev: 'Stop', property: 'stop' },
  // Histidine
  'CAT': { aminoAcid: 'Histidine', abbrev: 'His', property: 'positive' },
  'CAC': { aminoAcid: 'Histidine', abbrev: 'His', property: 'positive' },
  // Glutamine
  'CAA': { aminoAcid: 'Glutamine', abbrev: 'Gln', property: 'polar' },
  'CAG': { aminoAcid: 'Glutamine', abbrev: 'Gln', property: 'polar' },
  // Asparagine
  'AAT': { aminoAcid: 'Asparagine', abbrev: 'Asn', property: 'polar' },
  'AAC': { aminoAcid: 'Asparagine', abbrev: 'Asn', property: 'polar' },
  // Lysine
  'AAA': { aminoAcid: 'Lysine', abbrev: 'Lys', property: 'positive' },
  'AAG': { aminoAcid: 'Lysine', abbrev: 'Lys', property: 'positive' },
  // Aspartic Acid
  'GAT': { aminoAcid: 'Aspartic Acid', abbrev: 'Asp', property: 'negative' },
  'GAC': { aminoAcid: 'Aspartic Acid', abbrev: 'Asp', property: 'negative' },
  // Glutamic Acid
  'GAA': { aminoAcid: 'Glutamic Acid', abbrev: 'Glu', property: 'negative' },
  'GAG': { aminoAcid: 'Glutamic Acid', abbrev: 'Glu', property: 'negative' },
  // Cysteine
  'TGT': { aminoAcid: 'Cysteine', abbrev: 'Cys', property: 'polar' },
  'TGC': { aminoAcid: 'Cysteine', abbrev: 'Cys', property: 'polar' },
  // Tryptophan
  'TGG': { aminoAcid: 'Tryptophan', abbrev: 'Trp', property: 'hydrophobic' },
  // Arginine
  'CGT': { aminoAcid: 'Arginine', abbrev: 'Arg', property: 'positive' },
  'CGC': { aminoAcid: 'Arginine', abbrev: 'Arg', property: 'positive' },
  'CGA': { aminoAcid: 'Arginine', abbrev: 'Arg', property: 'positive' },
  'CGG': { aminoAcid: 'Arginine', abbrev: 'Arg', property: 'positive' },
  'AGA': { aminoAcid: 'Arginine', abbrev: 'Arg', property: 'positive' },
  'AGG': { aminoAcid: 'Arginine', abbrev: 'Arg', property: 'positive' },
  // Glycine
  'GGT': { aminoAcid: 'Glycine', abbrev: 'Gly', property: 'hydrophobic' },
  'GGC': { aminoAcid: 'Glycine', abbrev: 'Gly', property: 'hydrophobic' },
  'GGA': { aminoAcid: 'Glycine', abbrev: 'Gly', property: 'hydrophobic' },
  'GGG': { aminoAcid: 'Glycine', abbrev: 'Gly', property: 'hydrophobic' },
};

export const PROPERTY_COLORS: Record<string, string> = {
  hydrophobic: '#f59e0b', // amber
  polar: '#06b6d4',       // cyan
  positive: '#8b5cf6',    // violet
  negative: '#ef4444',    // red
  start: '#22c55e',       // green
  stop: '#6b7280',        // gray
};

export interface DNAStrand {
  sequence: string;
  sedenion: number[];
  phase: number;
  frequency: number;
  id: string;
}

export interface GraphVertex {
  id: string;
  sequence: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  linker: string;
}
