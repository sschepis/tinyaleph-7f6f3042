import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, FolderOpen, Trash2, Edit2, Check, X, Clock, Layers
} from 'lucide-react';
import {
  SavedCircuit,
  getSavedCircuits,
  saveCircuit,
  deleteCircuit,
  renameCircuit,
  savedCircuitToRuntime,
} from '@/lib/quantum-circuit/storage';
import { GateInstance, Wire } from '@/lib/quantum-circuit/types';
import { toast } from '@/hooks/use-toast';

interface SaveLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGates: GateInstance[];
  currentWires: Wire[];
  onLoad: (wires: Wire[], gates: GateInstance[]) => void;
}

export const SaveLoadDialog = ({
  open,
  onOpenChange,
  currentGates,
  currentWires,
  onLoad,
}: SaveLoadDialogProps) => {
  const [circuits, setCircuits] = useState<SavedCircuit[]>([]);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [mode, setMode] = useState<'save' | 'load'>('load');
  
  useEffect(() => {
    if (open) {
      setCircuits(getSavedCircuits());
      setSaveName(`Circuit ${new Date().toLocaleDateString()}`);
    }
  }, [open]);
  
  const handleSave = () => {
    if (!saveName.trim()) return;
    
    saveCircuit(saveName.trim(), currentWires.length, currentGates);
    setCircuits(getSavedCircuits());
    setSaveName('');
    toast({
      title: "Circuit saved!",
      description: `"${saveName}" has been saved to your library.`,
    });
    onOpenChange(false);
  };
  
  const handleLoad = (circuit: SavedCircuit) => {
    const { wires, gates } = savedCircuitToRuntime(circuit);
    onLoad(wires, gates);
    toast({
      title: "Circuit loaded",
      description: `Loaded "${circuit.name}"`,
    });
    onOpenChange(false);
  };
  
  const handleDelete = (id: string, name: string) => {
    deleteCircuit(id);
    setCircuits(getSavedCircuits());
    toast({
      title: "Circuit deleted",
      description: `"${name}" has been removed.`,
    });
  };
  
  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameCircuit(id, editName.trim());
    setCircuits(getSavedCircuits());
    setEditingId(null);
    setEditName('');
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'save' ? (
              <><Save className="w-5 h-5 text-primary" /> Save Circuit</>
            ) : (
              <><FolderOpen className="w-5 h-5 text-primary" /> Circuit Library</>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save' 
              ? 'Save your current circuit to the browser library.'
              : 'Load a previously saved circuit or save your current work.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={mode === 'load' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('load')}
          >
            <FolderOpen className="w-4 h-4 mr-1" /> Load
          </Button>
          <Button
            variant={mode === 'save' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('save')}
            disabled={currentGates.length === 0}
          >
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
        
        {mode === 'save' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Circuit Name</label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter circuit name..."
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>{currentWires.length} qubits</span>
                </div>
                <div className="text-muted-foreground">
                  {currentGates.length} gates
                </div>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={!saveName.trim()}>
              <Save className="w-4 h-4 mr-2" /> Save Circuit
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {circuits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No saved circuits yet.</p>
                <p className="text-xs">Build a circuit and save it to see it here.</p>
              </div>
            ) : (
              circuits.map((circuit) => (
                <div
                  key={circuit.id}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
                >
                  {editingId === circuit.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(circuit.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleRename(circuit.id)}>
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => handleLoad(circuit)}>
                        <div className="font-medium text-sm">{circuit.name}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {circuit.numQubits}q
                          </span>
                          <span>{circuit.gates.length} gates</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(circuit.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditingId(circuit.id);
                            setEditName(circuit.name);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(circuit.id, circuit.name)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
