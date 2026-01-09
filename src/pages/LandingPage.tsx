import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Lock,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Building2
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const stats = [
  { value: '10x', label: 'Faster Development' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50+', label: 'Enterprise Clients' },
  { value: '$2M+', label: 'Cost Savings' },
];

const features = [
  {
    icon: Cpu,
    title: 'Advanced AI Infrastructure',
    description: 'Enterprise-grade symbolic AI and quantum computing primitives built for scale.'
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'SOC 2 compliant architecture with end-to-end encryption and audit logging.'
  },
  {
    icon: TrendingUp,
    title: 'Proven ROI',
    description: 'Customers report 40% reduction in R&D costs and 3x faster time-to-market.'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Deploy across 50+ regions with sub-100ms latency worldwide.'
  },
  {
    icon: Lock,
    title: 'Data Sovereignty',
    description: 'Keep your data in your preferred jurisdiction with flexible deployment options.'
  },
  {
    icon: Zap,
    title: 'Instant Integration',
    description: 'RESTful APIs and SDKs for Python, JavaScript, and enterprise platforms.'
  },
];

const useCases = [
  {
    industry: 'Financial Services',
    description: 'Risk modeling, fraud detection, and algorithmic trading with quantum-enhanced analytics.',
    metrics: '60% faster risk calculations'
  },
  {
    industry: 'Healthcare & Biotech',
    description: 'Drug discovery, protein folding simulations, and genomic analysis at scale.',
    metrics: '10x throughput improvement'
  },
  {
    industry: 'Manufacturing',
    description: 'Supply chain optimization, predictive maintenance, and quality control.',
    metrics: '$5M annual savings avg.'
  },
];

const BizLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Building2 className="w-4 h-4" />
              Enterprise Solutions
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">The Future of</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                Intelligent Computing
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              TinyAleph provides enterprise-grade symbolic AI, quantum simulation, 
              and advanced mathematics infrastructure that powers the next generation 
              of intelligent applications.
            </p>
            
          </motion.div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Enterprise Scale
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Production-ready infrastructure with the reliability and security your business demands.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                variants={fadeInUp}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted Across Industries
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From Fortune 500 companies to innovative startups, TinyAleph powers critical workloads.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-xl bg-card border border-border"
                variants={fadeInUp}
              >
                <div className="text-sm font-medium text-primary mb-3">
                  {useCase.industry}
                </div>
                <p className="text-muted-foreground mb-4">
                  {useCase.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {useCase.metrics}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 text-muted-foreground mb-8">
              <Users className="w-5 h-5" />
              <span>Trusted by leading organizations</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
              {['ACME Corp', 'TechGiant', 'InnovateCo', 'FutureLabs'].map((company, index) => (
                <div key={index} className="text-xl font-bold text-muted-foreground">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="relative p-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 text-center overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the companies already leveraging TinyAleph to build the future. 
                Get started with a personalized demo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Request Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Contact Sales
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Free pilot program
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Dedicated support
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Custom SLAs
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BizLanding;
