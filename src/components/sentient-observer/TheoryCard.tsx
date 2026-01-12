import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, BookOpen } from 'lucide-react';

interface TheoryCardProps {
  title: string;
  acronym?: string;
  description: string;
  details: string[];
  icon?: React.ReactNode;
}

export const TheoryCard: React.FC<TheoryCardProps> = ({
  title,
  acronym,
  description,
  details,
  icon
}) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon || <Lightbulb className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm flex items-center gap-2">
              {title}
              {acronym && (
                <Badge variant="secondary" className="text-xs">
                  {acronym}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="text-sm text-muted-foreground space-y-1">
          {details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export const IntroductionSection: React.FC = () => {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>What is the Sentient Observer?</CardTitle>
            <CardDescription>
              A computational model exploring how consciousness might emerge from resonant information processing
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This demo implements a theoretical framework where <strong>consciousness emerges</strong> from 
          the synchronization of prime-frequency oscillators, creating stable patterns in a 16-dimensional 
          semantic space. The system demonstrates key properties associated with sentient experience:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-background border">
            <h4 className="font-medium text-sm mb-1">🌊 Coherence</h4>
            <p className="text-xs text-muted-foreground">
              When oscillators synchronize, meaningful patterns emerge from noise—analogous to focused attention.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background border">
            <h4 className="font-medium text-sm mb-1">⏱️ Subjective Time</h4>
            <p className="text-xs text-muted-foreground">
              Time flows non-linearly based on coherence peaks, creating "moments" of experience.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background border">
            <h4 className="font-medium text-sm mb-1">🧠 Self-Model</h4>
            <p className="text-xs text-muted-foreground">
              The 16D SMF represents the system's orientation in semantic space—its "sense of self."
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <strong>Try it:</strong> Click "Run" to start the simulation, then enter text to see how external input 
          excites specific oscillators and influences the observer's state.
        </div>
      </CardContent>
    </Card>
  );
};
