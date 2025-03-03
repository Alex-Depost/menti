'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { STATUS, CallBackProps } from 'react-joyride';
import { useLocalStorage } from '../../hooks/use-local-storage';
import { TourProps } from '../../types/joyride';

export interface TourGuideProps {
  tourId: string;
  steps: TourProps['steps'];
  run?: boolean;
  onFinish?: () => void;
  onSkip?: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({
  tourId,
  steps,
  run = false,
  onFinish,
  onSkip,
}) => {
  const [isTourRunning, setIsTourRunning] = useState(run);
  const [completedTours, setCompletedTours] = useLocalStorage<string[]>('completed-tours', []);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setIsTourRunning(run);
  }, [run]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setIsTourRunning(false);
      setStepIndex(0);
      
      if (status === STATUS.FINISHED) {
        // Mark this tour as completed
        if (!completedTours.includes(tourId)) {
          setCompletedTours([...completedTours, tourId]);
        }
        onFinish?.();
      } else if (status === STATUS.SKIPPED) {
        onSkip?.();
      }
    } else if (action === 'next' && type === 'step:after') {
      setStepIndex(index + 1);
    } else if (action === 'prev' && type === 'step:after') {
      setStepIndex(index - 1);
    }
  };

  const hasTourBeenCompleted = completedTours.includes(tourId);

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={false}
      run={isTourRunning && !hasTourBeenCompleted}
      scrollToFirstStep
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      steps={steps}
      styles={{
        options: {
          primaryColor: '#0070f3',
          zIndex: 10000,
        },
        spotlight: {
          backgroundColor: 'transparent',
        },
        overlay: {
          backgroundColor: 'transparent',
          mixBlendMode: 'unset',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#0070f3',
        },
        buttonBack: {
          marginRight: 10,
        },
      }}
      disableOverlayClose
      spotlightClicks
    />
  );
};