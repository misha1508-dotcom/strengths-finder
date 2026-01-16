'use client';

import { useState } from 'react';
import { Situation, SituationAnalysis, FeatherInsight, AppStep } from '@/types';
import IntroScreen from '@/components/IntroScreen';
import InputScreen from '@/components/InputScreen';
import ProcessingScreen from '@/components/ProcessingScreen';
import ResultsScreen from '@/components/ResultsScreen';

export default function Home() {
  const [step, setStep] = useState<AppStep>('intro');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [featherInsight, setFeatherInsight] = useState<FeatherInsight | null>(null);

  const handleStart = () => {
    setStep('input');
  };

  const handleSituationAdd = (text: string) => {
    const newSituation: Situation = {
      id: situations.length + 1,
      text,
    };
    setSituations([...situations, newSituation]);
  };

  const handleAllSituationsComplete = async () => {
    setStep('processing');

    try {
      // Analyze all situations
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situations: situations.map(s => s.text) }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze situations');
      }

      const data = await response.json();

      // Update situations with analysis
      const analyzedSituations = situations.map((situation, index) => ({
        ...situation,
        analysis: data.analyses[index] as SituationAnalysis,
      }));

      setSituations(analyzedSituations);
      setFeatherInsight(data.featherInsight);
      setStep('results');
    } catch (error) {
      console.error('Error analyzing situations:', error);
      // Handle error - maybe show an error screen
      setStep('input');
    }
  };

  const handleRestart = () => {
    setSituations([]);
    setFeatherInsight(null);
    setStep('intro');
  };

  const handleBack = () => {
    setStep('intro');
  };

  return (
    <main className="min-h-screen bg-background">
      {step === 'intro' && <IntroScreen onStart={handleStart} />}

      {step === 'input' && (
        <InputScreen
          currentSituation={situations.length + 1}
          totalSituations={10}
          onSituationAdd={handleSituationAdd}
          onComplete={handleAllSituationsComplete}
          canComplete={situations.length >= 5}
          onBack={handleBack}
        />
      )}

      {step === 'processing' && (
        <ProcessingScreen situationsCount={situations.length} />
      )}

      {step === 'results' && featherInsight && (
        <ResultsScreen
          situations={situations}
          featherInsight={featherInsight}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
