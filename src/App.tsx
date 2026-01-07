import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CoreExamples from "./pages/CoreExamples";
import PhysicsExamples from "./pages/PhysicsExamples";
import BackendsExamples from "./pages/BackendsExamples";
import EngineExamples from "./pages/EngineExamples";
import ApiExamples from "./pages/ApiExamples";
import QuantumExamples from "./pages/QuantumExamples";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/core" element={<CoreExamples />} />
          <Route path="/physics" element={<PhysicsExamples />} />
          <Route path="/backends" element={<BackendsExamples />} />
          <Route path="/engine" element={<EngineExamples />} />
          <Route path="/api" element={<ApiExamples />} />
          <Route path="/quantum" element={<QuantumExamples />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
