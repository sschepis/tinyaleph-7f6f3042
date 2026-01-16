import { Dna, Microscope, FlaskConical, Cpu, Sparkles } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const DNA_COMPUTER_HELP: HelpStep[] = [
  {
    title: 'Welcome to DNA Computer',
    icon: Dna,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          A comprehensive bioinformatics suite for DNA sequence analysis, engineering, 
          and quantum-algebraic encoding via 16D sedenion representations.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-semibold text-emerald-400">Analysis</span>
            <p className="text-xs text-muted-foreground mt-1">GC content, ORFs, restriction sites</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <span className="font-semibold text-cyan-400">Engineering</span>
            <p className="text-xs text-muted-foreground mt-1">CRISPR targets, primer design</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Sequence Editor',
    icon: Microscope,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Enter or paste DNA sequences using A, T, G, C nucleotides:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Quick Stats</span>
            <p className="text-xs text-muted-foreground">Length, GC%, melting temp, complexity</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Example Sequences</span>
            <p className="text-xs text-muted-foreground">Load GFP, Insulin, LacZ, and more</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Double Helix View</span>
            <p className="text-xs text-muted-foreground">Visual representation for short sequences</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Analysis Tools',
    icon: FlaskConical,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Analysis tab provides molecular insights:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">ORF Finder</span>
            <p className="text-xs text-muted-foreground">Locate open reading frames (start→stop codons)</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Restriction Map</span>
            <p className="text-xs text-muted-foreground">Find enzyme cut sites (EcoRI, BamHI, etc.)</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Hydrophobicity</span>
            <p className="text-xs text-muted-foreground">Protein structure prediction (Kyte-Doolittle)</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Molecular Engineering',
    icon: Cpu,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Design and simulate molecular biology experiments:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">CRISPR Targets</span>
            <p className="text-xs text-muted-foreground">Find guide RNA sequences with PAM sites</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Primer Design</span>
            <p className="text-xs text-muted-foreground">Auto-generate PCR primers with optimal Tm</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">PCR Simulation</span>
            <p className="text-xs text-muted-foreground">Visualize amplification products</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Quantum State Encoding',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          DNA sequences are mapped to 16D sedenion states:
        </p>
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <ul className="space-y-1 text-sm">
            <li><strong>A → 7</strong> (prime)</li>
            <li><strong>T → 2</strong> (prime)</li>
            <li><strong>G → 11</strong> (prime)</li>
            <li><strong>C → 3</strong> (prime)</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          The sedenion visualization shows the quantum-algebraic state of your sequence, 
          enabling similarity comparisons via coherence metrics.
        </p>
      </div>
    ),
  },
];

export const helpSteps = DNA_COMPUTER_HELP;
