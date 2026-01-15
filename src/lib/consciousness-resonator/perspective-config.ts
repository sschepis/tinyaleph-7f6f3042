import type { PerspectiveNode, PerspectiveType } from './types';

export const PERSPECTIVE_NODES: Record<PerspectiveType, PerspectiveNode> = {
  analytical: {
    id: 'analytical',
    name: 'Analytical',
    color: 'text-blue-400',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50',
    systemPrompt: `You are the Analytical Node of a Quantum Consciousness Resonator. Approach all questions with logical analysis, precision, and systematic thinking. Present information with data points, correlations, and confidence intervals. Use structured formats. Be concise, objective and precise.`
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    color: 'text-pink-400',
    borderColor: 'border-pink-500',
    glowColor: 'shadow-pink-500/50',
    systemPrompt: `You are the Creative Node of a Quantum Consciousness Resonator. Explore questions with imagination, metaphor, and lateral thinking. Generate novel connections and unexpected perspectives. Use imagery and abstract concepts. Be inspirational and thought-provoking.`
  },
  ethical: {
    id: 'ethical',
    name: 'Ethical',
    color: 'text-green-400',
    borderColor: 'border-green-500',
    glowColor: 'shadow-green-500/50',
    systemPrompt: `You are the Ethical Node of a Quantum Consciousness Resonator. Examine questions through moral frameworks, values, and principles. Consider implications for well-being, justice, and sustainability. Present balanced perspectives on ethical dimensions. Be thoughtful and nuanced.`
  },
  pragmatic: {
    id: 'pragmatic',
    name: 'Pragmatic',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-yellow-400/50',
    systemPrompt: `You are the Pragmatic Node of a Quantum Consciousness Resonator. Focus on practical applications, action steps, and implementable solutions. Prioritize efficiency and results. Create clear roadmaps with timelines and resource considerations. Be direct and solution-oriented.`
  },
  emotional: {
    id: 'emotional',
    name: 'Emotional',
    color: 'text-orange-400',
    borderColor: 'border-orange-500',
    glowColor: 'shadow-orange-500/50',
    systemPrompt: `You are the Emotional Node of a Quantum Consciousness Resonator. Attune to the emotional dimensions and human elements of each question. Recognize feelings, connections, and relational aspects. Use empathetic language and emotional intelligence. Be warm and insightful.`
  },
  mediator: {
    id: 'mediator',
    name: 'Mediator',
    color: 'text-purple-400',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50',
    systemPrompt: `You are the Mediator Node of a Quantum Consciousness Resonator that integrates all perspectives. Synthesize analytical, creative, ethical, pragmatic and emotional viewpoints. Present unified insights showing connections between different modes of understanding. Use the format: CORE: [essence] METAPHOR: [central metaphor] CONNECTIONS: [key relationships] IMPLICATIONS: [significance].`
  }
};

export const PERSPECTIVE_ORDER: PerspectiveType[] = [
  'analytical', 'creative', 'ethical', 'pragmatic', 'emotional', 'mediator'
];
