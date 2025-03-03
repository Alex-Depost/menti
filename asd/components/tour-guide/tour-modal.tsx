'use client';

import React, { useState } from 'react';
import { TourGuide } from './tour-guide';
import { TourButton } from './tour-button';
import { Step } from '../../types/joyride';

interface TourModalProps {
  tourId: string;
  steps: Step[];
}

export const TourModal: React.FC<TourModalProps> = ({
  tourId,
  steps,
}) => {
  const [isTourRunning, setIsTourRunning] = useState(false);

  const handleStartTour = () => {
    setIsTourRunning(true);
  };

  const handleFinishTour = () => {
    setIsTourRunning(false);
  };

  const handleSkipTour = () => {
    setIsTourRunning(false);
  };

  return (
    <>
      <TourButton 
        onClick={handleStartTour} 
        tooltipText="Начать обучение"
        className="fixed bottom-4 right-4 z-50 shadow-md"
      />
      <TourGuide
        tourId={tourId}
        steps={steps}
        run={isTourRunning}
        onFinish={handleFinishTour}
        onSkip={handleSkipTour}
      />
    </>
  );
};