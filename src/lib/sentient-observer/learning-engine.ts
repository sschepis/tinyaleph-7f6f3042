/**
 * Learning Engine for Sentient Observer
 * 
 * Provides autonomous learning capabilities by querying an LLM "chaperone"
 * to learn new symbols, relationships, and concepts.
 */

import { supabase } from '@/integrations/supabase/client';
import type { SemanticPrimeMapper, PrimeMeaning } from './semantic-prime-mapper';

// ============= TYPES =============

export interface LearningGoal {
  id: string;
  type: 'define_symbol' | 'find_relationship' | 'expand_concept';
  description: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  targetPrime?: number;
  concepts?: string[];
  createdAt: number;
  completedAt?: number;
  result?: any;
}

export interface LearnedSymbol {
  prime: number;
  meaning: string;
  category?: string;
  relatedConcepts: string[];
  examples: string[];
  confidence: number;
  reasoning: string;
  learnedAt: number;
}

export interface LearnedRelationship {
  primeA: number;
  primeB: number;
  relationshipType: 'similar' | 'opposite' | 'contains' | 'part_of' | 'transforms_to' | 'resonates_with';
  strength: number;
  explanation: string;
  learnedAt: number;
}

export interface LearningSession {
  id: string;
  startedAt: number;
  goalsCompleted: number;
  symbolsLearned: number;
  relationshipsDiscovered: number;
  isActive: boolean;
}

export interface LearningEngineState {
  learningQueue: LearningGoal[];
  learnedSymbols: Map<number, LearnedSymbol>;
  learnedRelationships: LearnedRelationship[];
  currentSession: LearningSession | null;
  totalGoalsCompleted: number;
  isLearning: boolean;
  lastLearningAction: string | null;
}

// ============= STORAGE KEY =============
const STORAGE_KEY = 'sentient-observer-learned-knowledge';

// ============= LEARNING ENGINE =============

export class LearningEngine {
  private state: LearningEngineState;
  private mapper: SemanticPrimeMapper;
  private onUpdate: ((state: LearningEngineState) => void) | null = null;
  private learningInterval: number | null = null;

  constructor(mapper: SemanticPrimeMapper) {
    this.mapper = mapper;
    this.state = {
      learningQueue: [],
      learnedSymbols: new Map(),
      learnedRelationships: [],
      currentSession: null,
      totalGoalsCompleted: 0,
      isLearning: false,
      lastLearningAction: null
    };
    
    // Load persisted knowledge on initialization
    this.loadFromStorage();
  }

  /**
   * Load learned knowledge from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.symbols && Array.isArray(data.symbols)) {
          for (const symbol of data.symbols) {
            this.state.learnedSymbols.set(symbol.prime, symbol);
          }
        }
        if (data.relationships && Array.isArray(data.relationships)) {
          this.state.learnedRelationships = data.relationships;
        }
        if (typeof data.totalGoalsCompleted === 'number') {
          this.state.totalGoalsCompleted = data.totalGoalsCompleted;
        }
        console.log(`[LearningEngine] Loaded ${this.state.learnedSymbols.size} symbols, ${this.state.learnedRelationships.length} relationships from storage`);
      }
    } catch (e) {
      console.warn('[LearningEngine] Failed to load from storage:', e);
    }
  }

  /**
   * Save learned knowledge to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        symbols: Array.from(this.state.learnedSymbols.values()),
        relationships: this.state.learnedRelationships,
        totalGoalsCompleted: this.state.totalGoalsCompleted,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[LearningEngine] Failed to save to storage:', e);
    }
  }

  setOnUpdate(callback: (state: LearningEngineState) => void): void {
    this.onUpdate = callback;
  }

  private notifyUpdate(): void {
    if (this.onUpdate) {
      this.onUpdate({ ...this.state });
    }
  }

  getState(): LearningEngineState {
    return { ...this.state };
  }

  /**
   * Start an autonomous learning session
   */
  startLearningSession(intervalMs: number = 10000): void {
    if (this.state.currentSession?.isActive) return;

    this.state.currentSession = {
      id: `session_${Date.now()}`,
      startedAt: Date.now(),
      goalsCompleted: 0,
      symbolsLearned: 0,
      relationshipsDiscovered: 0,
      isActive: true
    };

    // Add initial learning goals based on current state
    this.identifyLearningOpportunities();

    // Start learning loop
    this.learningInterval = window.setInterval(() => {
      this.processNextGoal();
    }, intervalMs);

    this.notifyUpdate();
  }

  /**
   * Stop the learning session
   */
  stopLearningSession(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }

    if (this.state.currentSession) {
      this.state.currentSession.isActive = false;
    }

    this.notifyUpdate();
  }

  /**
   * Analyze current knowledge and identify learning opportunities
   */
  identifyLearningOpportunities(): void {
    const field = this.mapper.getField();
    const meanings = this.mapper.getAllMeanings();
    
    // Find primes without meanings (knowledge gaps)
    const uncatalogued = this.mapper.getUncataloguedPrimes();
    
    // Add goals for first few uncatalogued primes
    for (const prime of uncatalogued.slice(0, 3)) {
      if (!this.state.learningQueue.find(g => g.targetPrime === prime)) {
        this.addLearningGoal({
          type: 'define_symbol',
          description: `Learn meaning for prime ${prime}`,
          priority: 0.8,
          targetPrime: prime
        });
      }
    }

    // Periodically look for relationships
    if (meanings.length >= 10 && this.state.learnedRelationships.length < meanings.length * 2) {
      const highConfidence = meanings
        .filter(m => m.confidence > 0.7)
        .slice(0, 10)
        .map(m => m.meaning);
      
      if (highConfidence.length >= 3) {
        this.addLearningGoal({
          type: 'find_relationship',
          description: 'Discover relationships between high-confidence symbols',
          priority: 0.6,
          concepts: highConfidence
        });
      }
    }

    // Occasionally explore conceptual gaps
    if (Math.random() < 0.3) {
      this.addLearningGoal({
        type: 'expand_concept',
        description: 'Identify missing archetypal concepts',
        priority: 0.5
      });
    }

    this.notifyUpdate();
  }

  /**
   * Add a learning goal to the queue
   */
  addLearningGoal(goal: Omit<LearningGoal, 'id' | 'status' | 'createdAt'>): void {
    const newGoal: LearningGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
      createdAt: Date.now()
    };

    this.state.learningQueue.push(newGoal);
    this.state.learningQueue.sort((a, b) => b.priority - a.priority);
    this.notifyUpdate();
  }

  /**
   * Process the next goal in the queue
   */
  async processNextGoal(): Promise<void> {
    if (this.state.isLearning) return;

    const nextGoal = this.state.learningQueue.find(g => g.status === 'pending');
    if (!nextGoal) {
      // Regenerate opportunities if queue is empty
      this.identifyLearningOpportunities();
      return;
    }

    this.state.isLearning = true;
    nextGoal.status = 'in_progress';
    this.state.lastLearningAction = `Learning: ${nextGoal.description}`;
    this.notifyUpdate();

    try {
      const result = await this.executeGoal(nextGoal);
      nextGoal.status = 'completed';
      nextGoal.completedAt = Date.now();
      nextGoal.result = result;
      
      this.state.totalGoalsCompleted++;
      if (this.state.currentSession) {
        this.state.currentSession.goalsCompleted++;
      }

      // Process the results
      await this.integrateResults(nextGoal.type, result);

      this.state.lastLearningAction = `Learned: ${this.summarizeResult(nextGoal.type, result)}`;
    } catch (error) {
      console.error('Learning goal failed:', error);
      nextGoal.status = 'failed';
      this.state.lastLearningAction = `Failed: ${nextGoal.description}`;
    }

    this.state.isLearning = false;
    
    // Remove completed/failed goals older than 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.state.learningQueue = this.state.learningQueue.filter(
      g => g.status === 'pending' || g.status === 'in_progress' || 
           (g.completedAt && g.completedAt > fiveMinutesAgo)
    );

    this.notifyUpdate();
  }

  /**
   * Execute a learning goal via the chaperone API with retry logic
   */
  private async executeGoal(goal: LearningGoal, retryCount = 0): Promise<any> {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000; // 1 second base delay
    
    // Prepare context with known symbols
    const allMeanings = this.mapper.getAllMeanings();
    const knownSymbols = allMeanings
      .filter(m => m.confidence > 0.5)
      .slice(0, 20)
      .map(m => ({ prime: m.prime, meaning: m.meaning }));

    try {
      const response = await supabase.functions.invoke('symbol-chaperone', {
        body: {
          type: goal.type,
          context: {
            knownSymbols,
            targetPrime: goal.targetPrime,
            concepts: goal.concepts,
            question: goal.description
          }
        }
      });

      if (response.error) {
        // Check if this is a retryable error (5xx, network issues)
        const isRetryable = response.error.message?.includes('5') || 
                           response.error.message?.includes('network') ||
                           response.error.message?.includes('timeout') ||
                           response.error.message?.includes('Failed to send');
        
        if (isRetryable && retryCount < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, retryCount); // Exponential backoff
          console.log(`[LearningEngine] Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          this.state.lastLearningAction = `Retrying: ${goal.description} (attempt ${retryCount + 2})`;
          this.notifyUpdate();
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.executeGoal(goal, retryCount + 1);
        }
        
        throw new Error(response.error.message);
      }

      return response.data?.result;
    } catch (error) {
      // Network errors - retry if possible
      if (retryCount < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retryCount);
        console.log(`[LearningEngine] Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        this.state.lastLearningAction = `Network error, retrying... (attempt ${retryCount + 2})`;
        this.notifyUpdate();
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeGoal(goal, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Integrate learned results into the system
   */
  private async integrateResults(type: LearningGoal['type'], result: any): Promise<void> {
    switch (type) {
      case 'define_symbol':
        if (result.prime && result.meaning) {
          const learned: LearnedSymbol = {
            prime: result.prime,
            meaning: result.meaning,
            category: result.category,
            relatedConcepts: result.relatedConcepts || [],
            examples: result.examples || [],
            confidence: result.confidence || 0.7,
            reasoning: result.reasoning || '',
            learnedAt: Date.now()
          };
          
          this.state.learnedSymbols.set(result.prime, learned);
          
          if (this.state.currentSession) {
            this.state.currentSession.symbolsLearned++;
          }
        }
        break;

      case 'find_relationship':
        if (result.relationships && Array.isArray(result.relationships)) {
          for (const rel of result.relationships) {
            if (rel.primeA && rel.primeB) {
              const learned: LearnedRelationship = {
                primeA: rel.primeA,
                primeB: rel.primeB,
                relationshipType: rel.relationshipType || 'resonates_with',
                strength: rel.strength || 0.5,
                explanation: rel.explanation || '',
                learnedAt: Date.now()
              };
              
              // Avoid duplicates
              const exists = this.state.learnedRelationships.some(
                r => (r.primeA === rel.primeA && r.primeB === rel.primeB) ||
                     (r.primeA === rel.primeB && r.primeB === rel.primeA)
              );
              
              if (!exists) {
                this.state.learnedRelationships.push(learned);
                if (this.state.currentSession) {
                  this.state.currentSession.relationshipsDiscovered++;
                }
              }
            }
          }
        }
        break;

      case 'expand_concept':
        // Suggestions for new concepts - queue them as future define_symbol goals
        if (result.suggestions && Array.isArray(result.suggestions)) {
          for (const suggestion of result.suggestions.slice(0, 3)) {
            // Find an unassigned prime for this concept
            const uncatalogued = this.mapper.getUncataloguedPrimes();
            const targetPrime = uncatalogued.find(p => 
              !this.state.learningQueue.some(g => g.targetPrime === p)
            );
            
            if (targetPrime) {
              this.addLearningGoal({
                type: 'define_symbol',
                description: `Define "${suggestion.concept}" for prime ${targetPrime}`,
                priority: 0.7,
                targetPrime,
                concepts: [suggestion.concept]
              });
            }
          }
        }
        break;
    }
    
    // Persist after learning
    this.saveToStorage();
  }

  /**
   * Summarize a learning result for display
   */
  private summarizeResult(type: LearningGoal['type'], result: any): string {
    switch (type) {
      case 'define_symbol':
        return result.meaning ? `${result.prime} → "${result.meaning}"` : 'No definition';
      case 'find_relationship':
        const count = result.relationships?.length || 0;
        return `${count} relationship${count === 1 ? '' : 's'}`;
      case 'expand_concept':
        const suggestions = result.suggestions?.length || 0;
        return `${suggestions} concept gap${suggestions === 1 ? '' : 's'}`;
      default:
        return 'Unknown result';
    }
  }

  /**
   * Get learned symbol for a prime
   */
  getLearnedSymbol(prime: number): LearnedSymbol | undefined {
    return this.state.learnedSymbols.get(prime);
  }

  /**
   * Get all learned symbols
   */
  getAllLearnedSymbols(): LearnedSymbol[] {
    return Array.from(this.state.learnedSymbols.values());
  }

  /**
   * Get relationships for a prime
   */
  getRelationshipsFor(prime: number): LearnedRelationship[] {
    return this.state.learnedRelationships.filter(
      r => r.primeA === prime || r.primeB === prime
    );
  }

  /**
   * Export learned knowledge for persistence
   */
  exportKnowledge(): { symbols: LearnedSymbol[]; relationships: LearnedRelationship[] } {
    return {
      symbols: this.getAllLearnedSymbols(),
      relationships: [...this.state.learnedRelationships]
    };
  }

  /**
   * Import previously learned knowledge
   */
  importKnowledge(data: { symbols?: LearnedSymbol[]; relationships?: LearnedRelationship[] }): void {
    if (data.symbols) {
      for (const symbol of data.symbols) {
        this.state.learnedSymbols.set(symbol.prime, symbol);
      }
    }
    if (data.relationships) {
      this.state.learnedRelationships = [...this.state.learnedRelationships, ...data.relationships];
    }
    this.saveToStorage();
    this.notifyUpdate();
  }

  /**
   * Clear all learned knowledge from storage and memory
   */
  clearKnowledge(): void {
    this.state.learnedSymbols.clear();
    this.state.learnedRelationships = [];
    this.state.totalGoalsCompleted = 0;
    localStorage.removeItem(STORAGE_KEY);
    this.notifyUpdate();
  }

  /**
   * Manually request to learn a specific concept
   */
  requestLearn(description: string, targetPrime?: number): void {
    this.addLearningGoal({
      type: targetPrime ? 'define_symbol' : 'expand_concept',
      description,
      priority: 1.0, // High priority for manual requests
      targetPrime
    });
  }

  /**
   * Get learning statistics
   */
  getStats(): {
    symbolsLearned: number;
    relationshipsDiscovered: number;
    goalsCompleted: number;
    queueLength: number;
    isActive: boolean;
  } {
    return {
      symbolsLearned: this.state.learnedSymbols.size,
      relationshipsDiscovered: this.state.learnedRelationships.length,
      goalsCompleted: this.state.totalGoalsCompleted,
      queueLength: this.state.learningQueue.filter(g => g.status === 'pending').length,
      isActive: this.state.currentSession?.isActive || false
    };
  }
}
