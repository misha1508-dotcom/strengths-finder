'use client';

import { useState, useEffect } from 'react';
import { Situation, SituationAnalysis, FeatherInsight, QualityRating, AppStep } from '@/types';
import IntroScreen from '@/components/IntroScreen';
import InputScreen from '@/components/InputScreen';
import ProcessingScreen from '@/components/ProcessingScreen';
import ResultsScreen from '@/components/ResultsScreen';

// localStorage keys
const STORAGE_KEYS = {
  situations: 'inversion_situations',
  step: 'inversion_step',
  results: 'inversion_results',
};

export default function Home() {
  const [step, setStep] = useState<AppStep>('intro');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [currentSituationIndex, setCurrentSituationIndex] = useState(0);
  const [featherInsight, setFeatherInsight] = useState<FeatherInsight>({
    summary: '',
    feathers: [],
    activities: [],
  });
  const [qualityRatings, setQualityRatings] = useState<QualityRating[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedSituations = localStorage.getItem(STORAGE_KEYS.situations);
      const savedStep = localStorage.getItem(STORAGE_KEYS.step);
      const savedResults = localStorage.getItem(STORAGE_KEYS.results);

      if (savedSituations) {
        const parsed = JSON.parse(savedSituations);
        setSituations(parsed);
      }

      // Only restore to input step (not processing or results without data)
      if (savedStep === 'input' && savedSituations) {
        setStep('input');
      }

      // Restore results if available
      if (savedResults && savedStep === 'results') {
        const results = JSON.parse(savedResults);
        if (results.situations) setSituations(results.situations);
        if (results.qualityRatings) setQualityRatings(results.qualityRatings);
        if (results.featherInsight) setFeatherInsight(results.featherInsight);
        setStep('results');
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save situations to localStorage when they change
  useEffect(() => {
    if (isHydrated && situations.length > 0) {
      localStorage.setItem(STORAGE_KEYS.situations, JSON.stringify(situations));
    }
  }, [situations, isHydrated]);

  // Save step to localStorage
  useEffect(() => {
    if (isHydrated && step !== 'processing') {
      localStorage.setItem(STORAGE_KEYS.step, step);
    }
  }, [step, isHydrated]);

  // Save results to localStorage
  useEffect(() => {
    if (isHydrated && step === 'results' && qualityRatings.length > 0) {
      localStorage.setItem(STORAGE_KEYS.results, JSON.stringify({
        situations,
        qualityRatings,
        featherInsight,
      }));
    }
  }, [step, situations, qualityRatings, featherInsight, isHydrated]);

  const handleStart = () => {
    setStep('input');
  };

  const handleSituationSave = (text: string, index: number) => {
    setSituations(prev => {
      const newSituations = [...prev];
      if (index < newSituations.length) {
        // Update existing situation
        newSituations[index] = { ...newSituations[index], text };
      } else {
        // Add new situation
        newSituations.push({ id: index + 1, text });
      }
      return newSituations;
    });
  };

  const handleNavigate = (index: number) => {
    setCurrentSituationIndex(index);
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get feathers');
      }

      const data = await response.json();
      setFeatherInsight(prev => ({
        ...prev,
        feathersStructured: data.feathersStructured,
        uniqueActions: data.uniqueActions,
      }));
    } catch (error) {
      console.error('Error getting feathers:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при получении рекомендаций');
    }
  };

  // Combined call for feathers + activities (saves tokens)
  const handleGetFeathersAndActivities = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situations, action: 'feathersAndActivities' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setFeatherInsight(prev => ({
        ...prev,
        feathersStructured: data.feathersStructured,
        uniqueActions: data.uniqueActions,
        sortedWeakQualities: data.sortedWeakQualities || [],
        sortedStrongQualities: data.sortedStrongQualities || [],
        roles: data.roles || [],
        capitalizeAdvice: data.capitalizeAdvice || [],
        hobbies: data.hobbies || [],
        celebrities: data.celebrities || [],
      }));
      return data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при получении рекомендаций');
      throw error;
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get activities');
      }

      const data = await response.json();
      setFeatherInsight(prev => ({
        ...prev,
        sortedWeakQualities: data.sortedWeakQualities || [],
        sortedStrongQualities: data.sortedStrongQualities || [],
        roles: data.roles || [],
        capitalizeAdvice: data.capitalizeAdvice || [],
        hobbies: data.hobbies || [],
        celebrities: data.celebrities || [],
      }));
    } catch (error) {
      console.error('Error getting activities:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при получении активностей');
    }
  };

  const handleRestart = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.situations);
    localStorage.removeItem(STORAGE_KEYS.step);
    localStorage.removeItem(STORAGE_KEYS.results);

    setSituations([]);
    setCurrentSituationIndex(0);
    setFeatherInsight({ summary: '', feathers: [], activities: [] });
    setQualityRatings([]);
    setStep('intro');
  };

  const handleBack = () => {
    setStep('intro');
  };

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--muted)]">Загрузка...</p>
        </div>
      </main>
    );
  }

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
            situations={situations}
            currentIndex={currentSituationIndex}
            onSituationSave={handleSituationSave}
            onNavigate={handleNavigate}
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
          onGetFeathersAndActivities={handleGetFeathersAndActivities}
        />
      )}
    </main>
  );
}
