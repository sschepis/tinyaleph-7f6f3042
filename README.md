# TinyAleph Interactive Documentation

A comprehensive interactive documentation and demo site for the [`@aleph-ai/tinyaleph`](https://www.npmjs.com/package/@aleph-ai/tinyaleph) library (v1.4.0)—a novel computational paradigm that encodes meaning as prime number signatures, embeds them in hypercomplex space, and performs reasoning through entropy minimization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)
![TinyAleph](https://img.shields.io/badge/tinyaleph-1.4.0-purple)

## Overview

This project provides live, interactive examples demonstrating the capabilities of the TinyAleph semantic computing library. Each module in the library has corresponding runnable demos that let you experiment with the API directly in your browser.

### Key Concepts

- **Prime Semantics**: Words and concepts are encoded as unique prime number signatures
- **16D Sedenion Space**: Semantic states live in hypercomplex (sedenion) vector spaces
- **Kuramoto Synchronization**: Oscillator dynamics for coherence and phase alignment
- **Entropy Minimization**: Reasoning as reduction of symbolic uncertainty
- **108 Topological Invariant**: Physical constants derived from 2² × 3³ = 108
- **CRT-Homology**: Chinese Remainder Theorem reconstruction with homology-based consistency detection
- **Observer Architecture**: Multi-layer sentient observer stack with SMF/PRSC

## Quick Start

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tinyaleph-docs

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
├── src/
│   ├── App.tsx                 # Main router configuration
│   ├── components/
│   │   ├── CodeBlock.tsx       # Syntax-highlighted code display
│   │   ├── EntropyVisualizer.tsx
│   │   ├── Hero.tsx            # Landing page hero section
│   │   ├── ModuleCard.tsx
│   │   ├── Navigation.tsx
│   │   ├── OscillatorVisualizer.tsx
│   │   ├── PrimeVisualizer.tsx
│   │   ├── SedenionVisualizer.tsx
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── tinyaleph-config.ts # Vocabulary and prime mappings
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Index.tsx           # Landing page
│   │   ├── QuickstartExamples.tsx
│   │   ├── CoreExamples.tsx
│   │   ├── MathExamples.tsx
│   │   ├── PhysicsExamples.tsx
│   │   ├── ScientificExamples.tsx
│   │   ├── SemanticExamples.tsx
│   │   ├── CryptoExamples.tsx
│   │   ├── MLExamples.tsx
│   │   ├── TypeSystemExamples.tsx
│   │   ├── QuantumExamples.tsx
│   │   ├── EngineExamples.tsx
│   │   ├── ApiExamples.tsx
│   │   ├── BackendsExamples.tsx
│   │   └── KuramotoExamples.tsx
│   └── integrations/
│       └── supabase/           # Edge function integration
├── supabase/
│   └── functions/              # Serverless compute functions
├── public/
└── package.json
```

## Interactive Examples

### Quickstart
- **Hello World** – Encode text to semantic states
- **Basic Hashing** – Hash strings with configurable dimensions
- **Quantum Coin Flip** – Superposition and Born rule measurement

### Core Module
- **Hypercomplex States** – Create and manipulate sedenion vectors
- **Prime Utilities** – Factorization, primality testing, nth prime

### Mathematics
- **Fano Plane** – Visualize octonion multiplication structure
- **Algebraic Integers** – Gaussian and Eisenstein integer operations
- **Prime Geometry** – Angular relationships of prime signatures

### Physics
- **Kuramoto Oscillators** – Phase synchronization dynamics
- **Order Parameter** – Collective coherence measurement
- **Entropy Tracking** – Real-time entropy visualization

### Scientific Computing
- **Shannon Entropy** – Information-theoretic measures
- **Lyapunov Exponents** – Stability analysis
- **Born Measurement** – Quantum-style state collapse
- **Decoherence** – Environmental interaction simulation

### Topology (New in v1.4.0)
- **108 Invariant** – Minimal closed-form twist configuration
- **Trefoil Constants** – Physical constant derivation from knot complexity
- **Gauge Symmetry** – Standard Model from 108 factorization
- **Free Energy Dynamics** – Cubic FEP for consciousness modeling

### CRT-Homology (New in v1.4.0)
- **Residue Encoding** – Coprime moduli distributions
- **Birkhoff Attention** – Doubly-stochastic projection
- **Homology Loss** – Topological consistency detection
- **CRT-ResoFormer** – Enhanced transformer architecture

### Discrete Dynamics (New in v1.4.0)
- **Integer Sine Tables** – Deterministic phase computation
- **Codebook Tunneling** – 64-attractor state transitions
- **Canonical Fusion** – Deterministic triad selection
- **Tick Gates** – Discrete-time activation gating

### Observer Stack (New in v1.4.0)
- **Sedenion Memory Field** – 16D semantic orientation
- **PRSC Layer** – Prime resonance oscillators
- **Temporal Layer** – Moment classification and history
- **Full Observer** – Integrated multi-layer architecture

### Semantic Processing
- **Text Encoding** – Tokenize and encode natural language
- **Semantic Similarity** – Cosine similarity in prime space
- **Word Clustering** – Hierarchical semantic grouping
- **Concept Vectors** – Visualize semantic embeddings

### Cryptography
- **Password Hashing** – Secure hash generation
- **HMAC** – Keyed hash authentication
- **Key Derivation** – PBKDF-style key stretching
- **Commitment Schemes** – Cryptographic commitments

### AI / Machine Learning
- **Quaternion Composition** – Hypercomplex rotations
- **Sparse Prime States** – Efficient state representation
- **Resonance Scoring** – Semantic alignment metrics
- **Coherence Gating** – Attention-like mechanisms

### Type System
- **Type Checking** – Formal type validation
- **Reduction Traces** – Step-by-step computation
- **Normal Forms** – Canonical representations
- **Lambda Translation** – λ-calculus encoding

### Quantum States
- **PrimeState** – Quantum-inspired semantic states
- **Born Measurement** – Probabilistic collapse
- **Operators P̂, R̂, Ĥ** – Prime, rotation, and Hamiltonian operators
- **Coherence Tracking** – Quantum coherence metrics

### Engine Module
- **AlephEngine** – Unified computation pipeline
- **Transform Pipelines** – Composable transformations
- **Entropy Minimization** – Reasoning via entropy reduction
- **Field States** – Continuous semantic fields

### Backend API
- **Edge Functions** – Serverless compute examples
- **Heavy Computations** – Server-side processing
- **Prime Endpoints** – REST API for prime operations

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AlephEngine                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Oscillators │◄─┤   Field     │◄─┤      Transform          │ │
│  │  (Kuramoto) │  │  (Sedenion) │  │      Pipeline           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ SemanticBackend │ │CryptographicBack│ │ScientificBackend│
│                 │ │                 │ │                 │
│ • Tokenization  │ │ • Hash          │ │ • Quantum sim   │
│ • Prime encode  │ │ • Key derive    │ │ • Wave collapse │
│ • Transforms    │ │ • Verify        │ │ • Measurement   │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Observer Stack (v1.4.0)                       │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ SedenionMemory  │    PRSCLayer    │      TemporalLayer          │
│     Field       │                 │                             │
│ • 16D semantic  │ • Prime indexed │ • Moment recording          │
│ • Named axes    │ • Kuramoto sync │ • State classification      │
│ • Entropy/coh   │ • Order param   │ • Trend detection           │
└─────────────────┴─────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CRT-Homology Layer (v1.4.0)                   │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ ResidueEncoder  │ BirkhoffProject │      HomologyLoss           │
│                 │                 │                             │
│ • Coprime mod   │ • Sinkhorn-Knopp│ • Kernel detection          │
│ • CRT recon     │ • Doubly-stoch  │ • Betti numbers             │
│ • Error detect  │ • Conservation  │ • Cycle penalties           │
└─────────────────┴─────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Topology Layer (v1.4.0)                       │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    TWIST_108    │   TREFOIL Knot  │    FreeEnergyDynamics       │
│                 │                 │                             │
│ • 2² × 3³ = 108 │ • T = 17        │ • dψ/dt = αψ + βψ² + γψ³    │
│ • Twist angles  │ • Mass ratios   │ • Fixed points              │
│ • Gauge symm    │ • Fine struct   │ • Observer hierarchy        │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router 6 |
| **State** | React Query |
| **Visualization** | Recharts, custom SVG |
| **Core Library** | @aleph-ai/tinyaleph |
| **Backend** | Supabase Edge Functions |

## Using the TinyAleph Library

Install the library in your own projects:

```bash
npm install @aleph-ai/tinyaleph
```

Basic usage:

```typescript
import { createEngine } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

// Create a semantic engine
const engine = createEngine('semantic', config);

// Run a query
const result = engine.run('What is wisdom?');

console.log('Output:', result.output);
console.log('Entropy:', result.entropy);
console.log('Order Parameter:', result.oscillators.orderParameter);
```

For more examples, see the [interactive demos](/) or the [npm package documentation](https://www.npmjs.com/package/@aleph-ai/tinyaleph).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## What's New in v1.4.0

### Topological Invariants
- **108 Invariant**: The fundamental 2² × 3³ = 108 that generates gauge symmetries
- **Knot Theory**: Trefoil complexity T = 17 derives physical constants
- **Physical Constants**: Proton/electron ratio (1836), fine structure (137), Higgs mass (125 GeV)

### CRT-Homology Framework
- **Residue Encoding**: Encode hidden vectors over coprime moduli
- **Birkhoff Polytope**: Doubly-stochastic attention projection
- **Homology Loss**: Detect semantic inconsistencies as topological holes
- **CRT-ResoFormer**: Enhanced transformer with homology regularization

### Discrete Dynamics
- **Integer Sine Tables**: M=256 deterministic phase computation
- **64-Attractor Codebook**: Controlled state tunneling
- **Canonical Fusion**: Deterministic FUSE(p,q,r) triad selection
- **Tick Gates**: Prime-period discrete activation

### Observer Architecture
- **SedenionMemoryField**: 16D semantic state with named axes
- **PRSCLayer**: Prime-indexed coupled oscillators
- **TemporalLayer**: Moment classification and history tracking
- **Full Observer Stack**: Integrated multi-layer sentient observer

## License

This project is licensed under the MIT License.

## Related Projects

- [@aleph-ai/tinyaleph](https://www.npmjs.com/package/@aleph-ai/tinyaleph) – The core computational library (v1.4.0)
- [shadcn/ui](https://ui.shadcn.com/) – UI component library
- [Supabase](https://supabase.com/) – Backend infrastructure

---

Built with ☿ prime resonance, hypercomplex semantics, and topological invariants.
