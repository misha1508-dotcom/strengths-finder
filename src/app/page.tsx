'use client';

import { useState } from 'react';
import { Situation, SituationAnalysis, FeatherInsight, QualityRating, AppStep } from '@/types';
import IntroScreen from '@/components/IntroScreen';
import InputScreen from '@/components/InputScreen';
import ProcessingScreen from '@/components/ProcessingScreen';
import ResultsScreen from '@/components/ResultsScreen';

export default function Home() {
  const [step, setStep] = useState<AppStep>('intro');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [featherInsight, setFeatherInsight] = useState<FeatherInsight>({
    summary: '',
    feathers: [],
    uniqueActions: [],
    activities: [],
  });
  const [qualityRatings, setQualityRatings] = useState<QualityRating[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situations: situations.map(s => s.text) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze situations');
      }

      if (!data.analyses || !Array.isArray(data.analyses)) {
        throw new Error('Invalid response format');
      }

      const analyzedSituations = situations.map((situation, index) => ({
        ...situation,
        analysis: data.analyses[index] as SituationAnalysis,
      }));

      setSituations(analyzedSituations);
      setQualityRatings(data.qualityRatings || []);
      setStep('results');
    } catch (err) {
      console.error('Error analyzing situations:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при анализе');
      setStep('input');
    }
  };

  const handleGetFeathers = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situations, action: 'feathers' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get feathers');
      }

      const data = await response.json();
      setFeatherInsight(prev => ({
        ...prev,
        feathers: data.feathers || [],
        uniqueActions: data.uniqueActions || [],
      }));
    } catch (error) {
      console.error('Error getting feathers:', error);
    }
  };

  const handleGetActivities = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situations, action: 'activities' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get activities');
      }

      const data = await response.json();
      setFeatherInsight(prev => ({
        ...prev,
        activities: data.activities || [],
        sortedWeakQualities: data.sortedWeakQualities || [],
        sortedStrongQualities: data.sortedStrongQualities || [],
        roles: data.roles || [],
        money: data.money || [],
        hobbies: data.hobbies || [],
      }));
    } catch (error) {
      console.error('Error getting activities:', error);
    }
  };

  const handleRestart = () => {
    setSituations([]);
    setFeatherInsight({ summary: '', feathers: [], uniqueActions: [], activities: [] });
    setQualityRatings([]);
    setStep('intro');
  };

  const handleBack = () => {
    setStep('intro');
  };

  return (
    <main className="min-h-screen bg-background">
      {step === 'intro' && <IntroScreen onStart={handleStart} />}

      {step === 'input' && (
        <>
          {error && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
              {error}
            </div>
          )}
          <InputScreen
            currentSituation={situations.length + 1}
            totalSituations={10}
            onSituationAdd={handleSituationAdd}
            onComplete={handleAllSituationsComplete}
            canComplete={situations.length >= 2}
            onBack={handleBack}
          />
        </>
      )}

      {step === 'processing' && (
        <ProcessingScreen situationsCount={situations.length} />
      )}

      {step === 'results' && (
        <ResultsScreen
          situations={situations}
          featherInsight={featherInsight}
          qualityRatings={qualityRatings}
          onRestart={handleRestart}
          onGetFeathers={handleGetFeathers}
          onGetActivities={handleGetActivities}
        />
      )}
    </main>
  );
}
