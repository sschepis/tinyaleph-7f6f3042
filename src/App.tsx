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
import ResoFormerExamples from "./pages/ResoFormerExamples";
import ScientificExamples from "./pages/ScientificExamples";
import TypeSystemExamples from "./pages/TypeSystemExamples";
import ChatExamples from "./pages/ChatExamples";
import EnochianExamples from "./pages/EnochianExamples";
import NotFound from "./pages/NotFound";
// Docs pages
import GettingStarted from "./pages/docs/GettingStarted";
import UserGuide from "./pages/docs/UserGuide";
import AppIdeas from "./pages/docs/AppIdeas";
import ReferenceGuide from "./pages/docs/ReferenceGuide";

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
            <Route path="/core" element={<CoreExamples />} />
            <Route path="/physics" element={<PhysicsExamples />} />
            <Route path="/backends" element={<BackendsExamples />} />
            <Route path="/engine" element={<EngineExamples />} />
            <Route path="/api" element={<ApiExamples />} />
            <Route path="/quantum" element={<QuantumExamples />} />
            <Route path="/quantum/circuit" element={<QuantumCircuitRunner />} />
            <Route path="/kuramoto" element={<KuramotoExamples />} />
            <Route path="/quickstart" element={<QuickstartExamples />} />
            <Route path="/semantic" element={<SemanticExamples />} />
            <Route path="/crypto" element={<CryptoExamples />} />
            <Route path="/math" element={<MathExamples />} />
            <Route path="/ml" element={<MLExamples />} />
            <Route path="/resoformer" element={<ResoFormerExamples />} />
            <Route path="/scientific" element={<ScientificExamples />} />
            <Route path="/typesystem" element={<TypeSystemExamples />} />
            <Route path="/chat" element={<ChatExamples />} />
            <Route path="/enochian" element={<EnochianExamples />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
