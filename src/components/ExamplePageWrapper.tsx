import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import CodeBlock from './CodeBlock';

export interface ExampleConfig {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  concepts: string[];
  code: string;
  codeTitle?: string;
}

interface ExamplePageWrapperProps {
  category: string;
  title: string;
  description: string;
  examples: ExampleConfig[];
  exampleComponents: Record<string, React.FC>;
  previousSection?: { title: string; path: string };
  nextSection?: { title: string; path: string };
}

const ExamplePageWrapper = ({
  category,
  title,
  description,
  examples,
  exampleComponents,
  previousSection,
  nextSection,
}: ExamplePageWrapperProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExample = examples[currentIndex];
  const ExampleComponent = exampleComponents[currentExample.id];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === examples.length - 1 ? 0 : prev + 1));
  };

  const isLastExample = currentIndex === examples.length - 1;
  const isFirstExample = currentIndex === 0;

  return (
    <div className="pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Examples
          </Link>
          <Badge variant="outline" className="mb-2">{category}</Badge>
          <h1 className="text-3xl font-display font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Navigation Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {examples.map((example, index) => (
            <button
              key={example.id}
              onClick={() => setCurrentIndex(index)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${index === currentIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {example.number}. {example.title}
            </button>
          ))}
        </div>

        {/* Example Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExample.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Example Header Card */}
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{currentExample.number}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentExample.title}</h2>
                    <p className="text-sm text-muted-foreground">{currentExample.subtitle}</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {currentExample.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentExample.concepts.map((concept) => (
                    <Badge key={concept} variant="secondary">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactive Demo */}
            <Card className="mb-6">
              <div className="px-6 py-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm">Interactive Demo</h3>
              </div>
              <CardContent className="pt-6">
                <ExampleComponent />
              </CardContent>
            </Card>

            {/* Code Example */}
            <CodeBlock 
              code={currentExample.code} 
              language="javascript" 
              title={currentExample.codeTitle || `${currentExample.id}.js`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
          <Button
            variant="outline"
            onClick={goToPrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="p-1"
              >
                <Circle
                  className={`w-2 h-2 transition-colors ${
                    index === currentIndex 
                      ? 'fill-primary text-primary' 
                      : 'fill-muted text-muted'
                  }`}
                />
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={goToNext}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Section Navigation (to next/previous module) */}
        {(previousSection || nextSection) && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              {previousSection ? (
                <Link to={previousSection.path}>
                  <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">Previous Section</div>
                      <div className="font-medium">{previousSection.title}</div>
                    </div>
                  </Button>
                </Link>
              ) : <div />}
              
              {nextSection ? (
                <Link to={nextSection.path}>
                  <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Next Section</div>
                      <div className="font-medium">{nextSection.title}</div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : <div />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamplePageWrapper;
