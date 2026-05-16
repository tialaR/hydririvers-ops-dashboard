'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import {
  SCREEN_TRANSITION_LEAVE_EVENT,
} from './screen-transition.constants';
import styles from './screen-transition.module.scss';

type ScreenTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function ScreenTransition({
  children,
  className,
}: ScreenTransitionProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const handleScreenLeave = () => {
      setIsLeaving(true);
    };

    window.addEventListener(SCREEN_TRANSITION_LEAVE_EVENT, handleScreenLeave);

    return () => {
      window.removeEventListener(SCREEN_TRANSITION_LEAVE_EVENT, handleScreenLeave);
    };
  }, []);

  const screenClassName = [
    styles.screen,
    isLeaving ? styles.screenLeaving : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={screenClassName}>{children}</div>;
}
