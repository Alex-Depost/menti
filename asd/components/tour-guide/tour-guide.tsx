'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { STATUS, CallBackProps } from 'react-joyride';
import { useLocalStorage } from '../../hooks/use-local-storage';
import { TourProps, Step } from '../../types/joyride';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    setIsTourRunning(run);

    // If the tour is starting and the first step has a navigation action, execute it
    if (run && steps.length > 0 && steps[0].action === 'navigate' && steps[0].path) {
      router.push(steps[0].path);
    }
  }, [run, steps, router]);

  // We're using the mobile tour for all devices now
  // No need to manage the sidebar since all steps target 'body'

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
      // Check if the next step has a navigation action
      const nextStep = steps[index + 1];
      if (nextStep && nextStep.action === 'navigate' && nextStep.path) {
        // Navigate to the specified path
        router.push(nextStep.path);
      }
      
      // Advance to the next step immediately
      setStepIndex(index + 1);
    } else if (action === 'prev' && type === 'step:after') {
      // Go back to the previous step immediately
      setStepIndex(index - 1);
    }
  };

  const hasTourBeenCompleted = completedTours.includes(tourId);

  // Wait for elements to be mounted before starting the tour
  useEffect(() => {
    if (isTourRunning && !hasTourBeenCompleted) {
      // Check if all targets are mounted
      const checkTargets = () => {
        const allTargetsExist = steps.every(step => {
          if (step.target === 'body') return true;
          const target = document.querySelector(step.target as string);
          return !!target;
        });

        if (!allTargetsExist) {
          // If targets aren't mounted yet, retry after a delay
          setTimeout(checkTargets, 300);
        }
      };

      checkTargets();
    }
  }, [isTourRunning, hasTourBeenCompleted, steps]);

  // Prepare steps with additional checks
  const preparedSteps = React.useMemo(() => {
    return steps.map(step => ({
      ...step,
      // Disable events that might cause issues
      disableOverlayClose: true,
      disableCloseOnEsc: false,
      spotlightClicks: false
    }));
  }, [steps]);

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
      steps={preparedSteps}
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
          pointerEvents: 'auto', // Ensure tooltip is clickable
        },
        // Style buttons to match UI design system
        buttonNext: {
          backgroundColor: 'var(--primary)',
          borderRadius: '0.375rem',
          color: 'var(--primary-foreground)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '0.5rem 1rem',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.2s',
          cursor: 'pointer',
        },
        buttonBack: {
          backgroundColor: 'transparent',
          borderRadius: '0.375rem',
          color: 'var(--foreground)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '0.5rem 1rem',
          border: '1px solid var(--border)',
          marginRight: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.2s',
          cursor: 'pointer',
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          color: 'var(--muted-foreground)',
          fontSize: '0.875rem',
          fontWeight: '500',
          border: 'none',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        },
        buttonClose: {
          color: 'var(--muted-foreground)',
          background: 'transparent',
          border: 'none',
          padding: '0.25rem',
          borderRadius: '0.375rem',
          cursor: 'pointer',
        }
      }}
      disableOverlayClose
      spotlightClicks={false}
      locale={{
        back: 'Назад',
        close: 'Закрыть',
        last: 'Завершить',
        next: 'Далее',
        skip: 'Пропустить'
      }}
      // Simple floater props
      floaterProps={{
        hideArrow: false,
        disableAnimation: false
      }}
      // Fix accessibility issues
      nonce="fix-accessibility"
      // Disable features that might cause issues
      disableCloseOnEsc={false}
      disableOverlay={false}
    />
  );
};