import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import CoreExamples from "./pages/CoreExamples";
import PhysicsExamples from "./pages/PhysicsExamples";
import BackendsExamples from "./pages/BackendsExamples";
import EngineExamples from "./pages/EngineExamples";
import ApiExamples from "./pages/ApiExamples";
import QuantumExamples from "./pages/QuantumExamples";
import QuantumCircuitRunner from "./pages/QuantumCircuitRunner";
import KuramotoExamples from "./pages/KuramotoExamples";
import QuickstartExamples from "./pages/QuickstartExamples";
import SemanticExamples from "./pages/SemanticExamples";
import CryptoExamples from "./pages/CryptoExamples";
import MathExamples from "./pages/MathExamples";
import MLExamples from "./pages/MLExamples";

import ScientificExamples from "./pages/ScientificExamples";
import TypeSystemExamples from "./pages/TypeSystemExamples";
import ChatExamples from "./pages/ChatExamples";
import EnochianExamples from "./pages/EnochianExamples";
import DNAComputer from "./pages/DNAComputer";
import SymbolicAIExamples from "./pages/SymbolicAIExamples";
import AIExamples from "./pages/AIExamples";
import SymbolicMind from "./pages/SymbolicMind";
import JamPartner from "./pages/JamPartner";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
// New v1.4.0 example pages
import TopologyExamples from "./pages/TopologyExamples";
import ArithmeticTopologyExamples from "./pages/ArithmeticTopologyExamples";
import CRTHomologyExamples from "./pages/CRTHomologyExamples";
import DiscreteExamples from "./pages/DiscreteExamples";
import ObserverExamples from "./pages/ObserverExamples";
import SentientObserverApp from "./pages/SentientObserverApp";
import QuantumConsciousnessResonator from "./pages/QuantumConsciousnessResonator";
import SephiroticOscillator from "./pages/SephiroticOscillator";
import WebLLMChat from "./pages/WebLLMChat";
import PrimeResonanceApp from "./pages/PrimeResonanceApp";
import QuantumWavefunctionApp from "./pages/QuantumWavefunctionApp";
import QuantumEntanglementLab from "./pages/QuantumEntanglementLab";
import BB84Simulator from "./pages/BB84Simulator";
import GroverSearch from "./pages/GroverSearch";
import QuantumErrorCorrectionLab from "./pages/QuantumErrorCorrectionLab";
import DecoherenceSimulator from "./pages/DecoherenceSimulator";
import QuaternionNonlocalApp from "./pages/QuaternionNonlocalApp";
import PulsarTransceiver from "./pages/PulsarTransceiver";
import VacuumComputationLab from "./pages/VacuumComputationLab";
import CosmicHolographicExplorer from "./pages/CosmicHolographicExplorer";
import ThermodynamicSemanticsDashboard from "./pages/ThermodynamicSemanticsDashboard";
import GettingStarted from "./pages/docs/GettingStarted";
import UserGuide from "./pages/docs/UserGuide";
import AppIdeas from "./pages/docs/AppIdeas";
import ReferenceGuide from "./pages/docs/ReferenceGuide";
import ConceptDocs from "./pages/docs/ConceptDocs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Docs routes */}
            <Route path="/docs/getting-started" element={<GettingStarted />} />
            <Route path="/docs/user-guide" element={<UserGuide />} />
            <Route path="/docs/app-ideas" element={<AppIdeas />} />
            <Route path="/docs/reference" element={<ReferenceGuide />} />
            <Route path="/docs/concepts" element={<ConceptDocs />} />
            <Route path="/docs/concepts/:section/:file" element={<ConceptDocs />} />
            <Route path="/core" element={<CoreExamples />} />
            <Route path="/physics" element={<PhysicsExamples />} />
            <Route path="/backends" element={<BackendsExamples />} />
            <Route path="/engine" element={<EngineExamples />} />
            <Route path="/api" element={<ApiExamples />} />
            <Route path="/quantum" element={<QuantumExamples />} />
            <Route path="/circuit-runner" element={<QuantumCircuitRunner />} />
            <Route path="/kuramoto" element={<KuramotoExamples />} />
            <Route path="/quickstart" element={<QuickstartExamples />} />
            <Route path="/semantic" element={<SemanticExamples />} />
            <Route path="/crypto" element={<CryptoExamples />} />
            <Route path="/math" element={<MathExamples />} />
            <Route path="/ml" element={<MLExamples />} />
            
            <Route path="/scientific" element={<ScientificExamples />} />
            <Route path="/typesystem" element={<TypeSystemExamples />} />
            <Route path="/chat" element={<ChatExamples />} />
            <Route path="/enochian" element={<EnochianExamples />} />
            <Route path="/dna-computer" element={<DNAComputer />} />
            <Route path="/symbolic" element={<SymbolicAIExamples />} />
            <Route path="/symbolic-mind" element={<SymbolicMind />} />
            <Route path="/ai" element={<AIExamples />} />
            <Route path="/landing-page" element={<LandingPage />} />
            {/* New v1.4.0 routes */}
            <Route path="/topology" element={<TopologyExamples />} />
            <Route path="/arithmetic-topology" element={<ArithmeticTopologyExamples />} />
            <Route path="/crt-homology" element={<CRTHomologyExamples />} />
            <Route path="/discrete" element={<DiscreteExamples />} />
            <Route path="/observer" element={<ObserverExamples />} />
            <Route path="/sentient-observer" element={<SentientObserverApp />} />
            <Route path="/jam-partner" element={<JamPartner />} />
            <Route path="/consciousness-resonator" element={<QuantumConsciousnessResonator />} />
            <Route path="/sephirotic-oscillator" element={<SephiroticOscillator />} />
            <Route path="/webllm" element={<WebLLMChat />} />
            <Route path="/prime-resonance" element={<PrimeResonanceApp />} />
            <Route path="/quantum-wavefunction" element={<QuantumWavefunctionApp />} />
            <Route path="/entanglement-lab" element={<QuantumEntanglementLab />} />
            <Route path="/bb84" element={<BB84Simulator />} />
            <Route path="/grover-search" element={<GroverSearch />} />
            <Route path="/qec-lab" element={<QuantumErrorCorrectionLab />} />
            <Route path="/decoherence" element={<DecoherenceSimulator />} />
            <Route path="/quaternion-nonlocal" element={<QuaternionNonlocalApp />} />
            <Route path="/pulsar-transceiver" element={<PulsarTransceiver />} />
            <Route path="/vacuum-computation" element={<VacuumComputationLab />} />
            <Route path="/cosmic-holographic" element={<CosmicHolographicExplorer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
