'use client';

import React, { useState, useEffect } from 'react';
import { TourGuide } from './tour-guide';
import { Step } from '../../types/joyride';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface TourModalProps {
  tourId: string;
  steps: Step[];
}

// Key for tracking if user has seen the tour
const TOUR_SEEN_KEY = 'tour-seen';

export const TourModal: React.FC<TourModalProps> = ({
  tourId,
  steps,
}) => {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourSeen, setTourSeen] = useLocalStorage<string[]>(TOUR_SEEN_KEY, []);
  
  // Check if this is a new user by looking for a flag in localStorage
  const isNewUser = typeof window !== 'undefined' && localStorage.getItem('is-new-user') === 'true';
  
  useEffect(() => {
    // If this is a new user and they haven't seen this tour yet, start it automatically
    if (isNewUser && !tourSeen.includes(tourId)) {
      startTour();
      // Clear the new user flag so the tour doesn't start again on next visit
      localStorage.removeItem('is-new-user');
    }
  }, [isNewUser, tourId, tourSeen]);

  // We're using the mobile tour for all devices now
  // No need to manage the sidebar since all steps target 'body'
  
  const startTour = () => {
    // Start the tour immediately for all devices
    setIsTourRunning(true);
  };

  const handleStartTour = () => {
    startTour();
  };

  const handleFinishTour = () => {
    setIsTourRunning(false);
    // Mark this tour as seen
    if (!tourSeen.includes(tourId)) {
      setTourSeen([...tourSeen, tourId]);
    }
  };

  const handleSkipTour = () => {
    setIsTourRunning(false);
    // Mark this tour as seen even if skipped
    if (!tourSeen.includes(tourId)) {
      setTourSeen([...tourSeen, tourId]);
    }
  };

  return (
    <TourGuide
      tourId={tourId}
      steps={steps}
      run={isTourRunning}
      onFinish={handleFinishTour}
      onSkip={handleSkipTour}
    />
  );
};