import { ReactNode } from 'react';

export interface Step {
  target: string;
  content: ReactNode;
  title?: string;
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  disableOverlayClose?: boolean;
  disableCloseOnEsc?: boolean;
  disableOverlay?: boolean;
  disableScrollParentFix?: boolean;
  disableScrolling?: boolean;
  event?: 'click' | 'hover';
  hideCloseButton?: boolean;
  hideFooter?: boolean;
  isFixed?: boolean;
  offset?: number;
  showProgress?: boolean;
  showSkipButton?: boolean;
  spotlightClicks?: boolean;
  spotlightPadding?: number;
  // Custom properties for navigation
  action?: 'navigate' | string;
  path?: string;
  styles?: {
    options?: object;
    beacon?: object;
    beaconInner?: object;
    beaconOuter?: object;
    buttonClose?: object;
    buttonNext?: object;
    buttonBack?: object;
    buttonSkip?: object;
    overlay?: object;
    spotlight?: object;
    tooltip?: object;
    tooltipContainer?: object;
    tooltipContent?: object;
    tooltipFooter?: object;
    tooltipTitle?: object;
  };
}

export interface TourProps {
  steps: Step[];
  run: boolean;
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  showCloseButton?: boolean;
  disableCloseOnEsc?: boolean;
  disableOverlayClose?: boolean;
  hideBackButton?: boolean;
  spotlightClicks?: boolean;
  styles?: {
    options?: object;
    overlay?: object;
    spotlight?: object;
    floater?: object;
    tooltip?: object;
    buttonClose?: object;
    buttonNext?: object;
    buttonBack?: object;
    buttonSkip?: object;
  };
  locale?: {
    back?: string;
    close?: string;
    last?: string;
    next?: string;
    skip?: string;
  };
  callback?: (data: {
    action: string;
    index: number;
    status: string;
    type: string;
  }) => void;
}