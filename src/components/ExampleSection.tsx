import { ReactNode } from 'react';
import CodeBlock from './CodeBlock';

interface ExampleSectionProps {
  id: string;
  title: string;
  description: string;
  code: string;
  language?: string;
  visualization?: ReactNode;
  features?: string[];
}

const ExampleSection = ({ 
  id, 
  title, 
  description, 
  code, 
  language = 'javascript',
  visualization,
  features 
}: ExampleSectionProps) => {
  return (
    <section id={id} className="py-16 border-b border-border last:border-b-0">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-display font-bold mb-3 gradient-text">{title}</h2>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
          
          {features && features.length > 0 && (
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-secondary-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          )}
          
          {visualization && (
            <div className="p-6 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
              {visualization}
            </div>
          )}
        </div>
        
        <div className="lg:sticky lg:top-24">
          <CodeBlock code={code} language={language} title={`${id}.js`} />
        </div>
      </div>
    </section>
  );
};

export default ExampleSection;
