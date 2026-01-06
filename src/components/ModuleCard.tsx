import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const ModuleCard = ({ icon: Icon, title, description, children, onClick, active }: ModuleCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`
        group relative rounded-xl border bg-card p-6 transition-all duration-300 cursor-pointer
        ${active 
          ? 'border-primary/50 glow-box' 
          : 'border-border hover:border-primary/30'
        }
      `}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className={`
            p-3 rounded-lg transition-colors
            ${active 
              ? 'bg-primary/20 text-primary' 
              : 'bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
            }
          `}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-border">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
