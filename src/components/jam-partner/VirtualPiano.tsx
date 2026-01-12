import React from 'react';
import { cn } from '@/lib/utils';
import { getNotesInRange } from '@/lib/jam-partner/note-database';

interface VirtualPianoProps {
  activeInputNotes: Set<string>;
  activeOutputNotes: Set<string>;
  onNoteOn: (noteId: string, velocity: number) => void;
  onNoteOff: (noteId: string) => void;
  startMidi?: number;
  endMidi?: number;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  activeInputNotes,
  activeOutputNotes,
  onNoteOn,
  onNoteOff,
  startMidi = 48, // C3
  endMidi = 72,   // C5
}) => {
  const notes = getNotesInRange(startMidi, endMidi);
  const whiteNotes = notes.filter(n => !n.isBlack);
  const blackNotes = notes.filter(n => n.isBlack);
  
  const whiteKeyWidth = 100 / whiteNotes.length;

  const getBlackKeyPosition = (midi: number): number => {
    const whiteIndex = whiteNotes.findIndex(n => n.midi > midi);
    return (whiteIndex - 0.5) * whiteKeyWidth;
  };

  return (
    <div className="relative h-40 select-none">
      {/* White keys */}
      <div className="flex h-full">
        {whiteNotes.map((note) => {
          const isInput = activeInputNotes.has(note.id);
          const isOutput = activeOutputNotes.has(note.id);
          return (
            <button
              key={note.id}
              className={cn(
                "flex-1 border border-border rounded-b-md transition-colors relative",
                isInput && "bg-primary",
                isOutput && "bg-amber-400",
                !isInput && !isOutput && "bg-card hover:bg-muted"
              )}
              onMouseDown={() => onNoteOn(note.id, 100)}
              onMouseUp={() => onNoteOff(note.id)}
              onMouseLeave={() => onNoteOff(note.id)}
            >
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                {note.id}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Black keys */}
      {blackNotes.map((note) => {
        const isInput = activeInputNotes.has(note.id);
        const isOutput = activeOutputNotes.has(note.id);
        const left = getBlackKeyPosition(note.midi);
        return (
          <button
            key={note.id}
            className={cn(
              "absolute top-0 h-[60%] rounded-b-md z-10 transition-colors",
              isInput && "bg-primary",
              isOutput && "bg-amber-400",
              !isInput && !isOutput && "bg-foreground hover:bg-muted-foreground"
            )}
            style={{ left: `${left}%`, width: `${whiteKeyWidth * 0.6}%` }}
            onMouseDown={() => onNoteOn(note.id, 100)}
            onMouseUp={() => onNoteOff(note.id)}
            onMouseLeave={() => onNoteOff(note.id)}
          />
        );
      })}
    </div>
  );
};
