import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

export const HelpButton = ({ onClick, className = '' }: HelpButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`h-8 w-8 ${className}`}
      title="Show help"
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
};
