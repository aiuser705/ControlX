'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from '@/app/login/login.module.css';

export type CatState =
  | 'idle'
  | 'email'
  | 'typing'
  | 'hidden'
  | 'visible'
  | 'error'
  | 'success'
  | 'blink'
  | 'backview';

const CAT_STATES: CatState[] = [
  'idle',
  'email',
  'typing',
  'hidden',
  'visible',
  'error',
  'success',
  'blink',
  'backview',
];

interface LoginCatStageProps {
  state: CatState;
}

export default function LoginCatStage({ state }: LoginCatStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const breatheTweenRef = useRef<gsap.core.Tween | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backviewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activeState, setActiveState] = useState<CatState>(state);
  const [internalOverride, setInternalOverride] = useState<CatState | null>(null);

  const currentState = internalOverride || state;

  const stopBreathe = React.useCallback(() => {
    if (breatheTweenRef.current) {
      breatheTweenRef.current.kill();
      breatheTweenRef.current = null;
    }
    if (stageRef.current) {
      gsap.set(stageRef.current, { scale: 1, rotation: 0, x: 0, y: 0 });
    }
  }, []);

  const startBreathe = React.useCallback(() => {
    stopBreathe();
    if (stageRef.current) {
      breatheTweenRef.current = gsap.to(stageRef.current, {
        scale: 1.015,
        duration: 2.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: '50% 100%',
      });
    }
  }, [stopBreathe]);

  // Synchronize state changes & GSAP animations
  useEffect(() => {
    setActiveState(currentState);

    if (currentState === 'idle') {
      startBreathe();
    } else {
      stopBreathe();
    }

    if (currentState === 'error' && stageRef.current) {
      gsap.timeline()
        .to(stageRef.current, { x: -7, rotation: -3, duration: 0.07, ease: 'power1.inOut' })
        .to(stageRef.current, { x: 7, rotation: 3, duration: 0.07, ease: 'power1.inOut' })
        .to(stageRef.current, { x: -4, rotation: -2, duration: 0.07, ease: 'power1.inOut' })
        .to(stageRef.current, { x: 0, rotation: 0, duration: 0.12, ease: 'power2.out' });
    }

    if (currentState === 'success' && stageRef.current) {
      gsap.timeline()
        .to(stageRef.current, { scale: 1.08, y: -8, duration: 0.28, ease: 'power2.out', transformOrigin: '50% 100%' })
        .to(stageRef.current, { scale: 1, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.55)' });
    }
  }, [currentState, startBreathe, stopBreathe]);

  // Teasing random blink timer when in idle state
  useEffect(() => {
    const scheduleBlink = () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      const delay = 3500 + Math.random() * 3000;
      blinkTimerRef.current = setTimeout(() => {
        if (state === 'idle' && !internalOverride) {
          setInternalOverride('blink');
          setTimeout(() => {
            setInternalOverride(null);
          }, 220);
        }
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [state, internalOverride]);

  // Handle clicking the cat for backview easter egg
  const handleCatClick = () => {
    if (backviewTimerRef.current) clearTimeout(backviewTimerRef.current);
    setInternalOverride('backview');
    backviewTimerRef.current = setTimeout(() => {
      setInternalOverride(null);
    }, 900);
  };

  return (
    <div
      ref={stageRef}
      className={styles.catStage}
      id="catStage"
      title="click me"
      onClick={handleCatClick}
    >
      {CAT_STATES.map((catState) => (
        <Image
          key={catState}
          data-state={catState}
          src={`/assets/cat/${catState}.png`}
          alt={`ControlX Cat - ${catState}`}
          width={270}
          height={206}
          className={activeState === catState ? 'active' : ''}
          unoptimized
          priority={catState === 'idle'}
        />
      ))}
    </div>
  );
}
