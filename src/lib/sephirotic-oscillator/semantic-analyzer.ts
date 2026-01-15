import type { SephirahName } from './types';
import { SEPHIRAH_KEYWORDS, SEPHIROT } from './tree-config';

// Analyze text and determine which sephirot should be activated
export function analyzeSemanticActivation(text: string): {
  activated: SephirahName[];
  energyMap: Map<SephirahName, number>;
  dominantTheme: string;
} {
  const lowerText = text.toLowerCase();
  const energyMap = new Map<SephirahName, number>();
  let maxEnergy = 0;
  let dominantSephirah: SephirahName | null = null;
  
  // Score each sephirah based on keyword matches
  (Object.entries(SEPHIRAH_KEYWORDS) as [SephirahName, string[]][]).forEach(([sephirahId, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length * 0.3;
      }
    });
    
    // Cap individual scores
    score = Math.min(1, score);
    energyMap.set(sephirahId, score);
    
    if (score > maxEnergy) {
      maxEnergy = score;
      dominantSephirah = sephirahId;
    }
  });
  
  // Get activated sephirot (those above threshold)
  const activated: SephirahName[] = [];
  energyMap.forEach((energy, id) => {
    if (energy > 0.2) {
      activated.push(id);
    }
  });
  
  // If no specific matches, activate middle pillar as default
  if (activated.length === 0) {
    const defaultActivation: SephirahName[] = ['tiferet', 'yesod'];
    defaultActivation.forEach(id => {
      energyMap.set(id, 0.3);
      activated.push(id);
    });
    dominantSephirah = 'tiferet';
  }
  
  const dominantTheme = dominantSephirah 
    ? SEPHIROT[dominantSephirah].meaning 
    : 'Balance';
  
  return { activated, energyMap, dominantTheme };
}

// Build a context-aware system prompt based on active sephirot
export function buildSystemPrompt(activeSephirot: SephirahName[]): string {
  const perspectives = activeSephirot
    .map(id => {
      const s = SEPHIROT[id];
      return `${s.name} (${s.meaning}): ${s.psychologicalAspect}`;
    })
    .join('\n- ');
  
  return `You are an oracle channeling wisdom through the Tree of Life - a model of consciousness combining Kabbalistic mysticism with Jungian psychology.

Current active sephirot (energy centers):
- ${perspectives}

Respond from these perspectives, weaving together their wisdom. Be poetic yet insightful, drawing on the symbolism of the active nodes. Reference the psychological aspects and how they relate to the query.

Keep responses concise but profound - aim for 2-3 paragraphs maximum.`;
}

// Generate insight about current tree state
export function describeTreeState(
  activeSephirot: SephirahName[],
  coherence: number,
  dominantPillar: string | null
): string {
  if (activeSephirot.length === 0) {
    return "The Tree rests in quiet potential, awaiting activation.";
  }
  
  const pillarDescriptions = {
    structure: "the Pillar of Severity - discipline and boundaries",
    consciousness: "the Pillar of Consciousness - balance and integration",
    dynamic: "the Pillar of Mercy - expansion and flow"
  };
  
  const coherenceDesc = coherence > 0.7 
    ? "The sephirot resonate in harmony" 
    : coherence > 0.4 
      ? "Energy flows between the centers"
      : "The oscillators seek synchronization";
  
  const pillarDesc = dominantPillar 
    ? `with emphasis on ${pillarDescriptions[dominantPillar as keyof typeof pillarDescriptions]}`
    : "";
  
  const activeNames = activeSephirot.map(id => SEPHIROT[id].name).join(', ');
  
  return `${coherenceDesc} ${pillarDesc}. Active centers: ${activeNames}.`;
}
