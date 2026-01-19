/**
 * Thermodynamic Semantics Help Content
 */

import { HelpStep } from '@/components/app-help/AppHelpDialog';
import { Thermometer, Gauge, LineChart, Bot, Zap, Settings } from 'lucide-react';

export function HelpContent(): HelpStep[] {
  return [
    {
      title: "Thermodynamic Semantics",
      icon: Thermometer,
      content: "Explore the deep connection between entropy reduction, meaning emergence, and computational efficiency. This dashboard visualizes how information processing obeys thermodynamic laws."
    },
    {
      title: "Landauer's Principle",
      icon: Zap,
      content: "Every irreversible bit erasure requires at least kT ln(2) of energy. Watch how computational processes approach or exceed this fundamental limit—the absolute minimum cost of computation."
    },
    {
      title: "Entropy-Meaning Relationship",
      icon: LineChart,
      content: "As systems reduce entropy through structure and correlation, meaning emerges. The time series shows this inverse relationship in real-time: lower entropy means more extracted meaning."
    },
    {
      title: "Maxwell's Demon",
      icon: Bot,
      content: "The demon gains information to sort particles, but must erase its memory, paying the Landauer cost. The net energy balance always respects the 2nd law of thermodynamics."
    },
    {
      title: "Process Comparison",
      icon: Gauge,
      content: "Compare different computational processes: semantic compression, neural computation, quantum error correction. See their efficiency relative to theoretical thermodynamic limits."
    },
    {
      title: "Configuration",
      icon: Settings,
      content: "Adjust temperature, noise level, and coupling strength to see how thermodynamic parameters affect meaning emergence and computational efficiency."
    }
  ];
}
