import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Keyboard, Brain, Waves } from 'lucide-react';
import { useJamPartner } from '@/hooks/useJamPartner';
import { VirtualPiano, HarmonyHeatmap, AutoTrainMode, JamControls } from '@/components/jam-partner';
import Layout from '@/components/Layout';

const JamPartner: React.FC = () => {
  const jam = useJamPartner();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-primary/10">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Jam Partner</h1>
            <p className="text-muted-foreground">AI music companion that learns to play alongside you</p>
          </div>
          <Badge variant="outline" className="ml-auto">{jam.mode}</Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Piano Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Virtual Piano
                </CardTitle>
                <CardDescription>
                  {jam.mode === 'jamming' 
                    ? 'Play notes and the AI will respond!'
                    : 'Train the AI by playing patterns'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground">AI Output</div>
                  <VirtualPiano
                    activeInputNotes={new Set()}
                    activeOutputNotes={jam.activeOutputNotes}
                    onNoteOn={() => {}}
                    onNoteOff={() => {}}
                  />
                  <div className="text-xs text-muted-foreground">Your Input</div>
                  <VirtualPiano
                    activeInputNotes={jam.activeInputNotes}
                    activeOutputNotes={new Set()}
                    onNoteOn={(id, vel) => jam.noteOn(id, vel)}
                    onNoteOff={(id) => jam.noteOff(id)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Harmony Visualization */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Waves className="w-5 h-5" />
                  Learned Harmony
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HarmonyHeatmap matrix={jam.harmonyMatrix} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Auto-Train
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AutoTrainMode
                  isTraining={jam.isAutoTraining}
                  progress={jam.autoTrainProgress}
                  currentScript={jam.autoTrainScript}
                  sequenceIndex={jam.autoTrainSequenceIndex}
                  onStart={jam.startAutoTrain}
                  onStop={jam.stopAutoTrain}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <JamControls
                  mode={jam.mode}
                  tempo={jam.tempo}
                  coherence={jam.coherence}
                  midiConnected={jam.midiConnected}
                  onModeChange={jam.setMode}
                  onTempoChange={jam.setTempo}
                  onConnectMIDI={jam.connectMIDI}
                  onReset={jam.reset}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JamPartner;
