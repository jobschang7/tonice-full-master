// components/AutoIncrement.tsx
'use client'

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/utils/game-mechaincs';

export function AutoIncrement() {
  const {
    lastClickTimestamp,
    profitPerHour,
    pointsPerClick,
    energy,
    maxEnergy,
    incrementPoints,
    incrementEnergy
  } = useGameStore();

  // Use a ref to store the latest values without causing re-renders
  const stateRef = useRef({ profitPerHour, pointsPerClick, lastClickTimestamp });

  // Update the ref when these values change
  useEffect(() => {
    stateRef.current = { profitPerHour, pointsPerClick, lastClickTimestamp };
  }, [profitPerHour, pointsPerClick, lastClickTimestamp]);

  const autoIncrement = useCallback(() => {
    const { profitPerHour, lastClickTimestamp } = stateRef.current;
    const pointsPerSecond = profitPerHour / 3600;
    const currentTime = Date.now();

    incrementPoints(pointsPerSecond);

    
    if (!(lastClickTimestamp && ((currentTime - lastClickTimestamp) < 2000))) {
      // console.log("Auto increment - Current time:", currentTime);
      // console.log("Auto increment - Last click timestamp:", lastClickTimestamp);
      // console.log("Auto increment - Time difference:", currentTime - lastClickTimestamp);
      // console.log("Auto increment - Incrementing energy");
      incrementEnergy(pointsPerClick);
    } else {
      // console.log("Auto increment - Not incrementing energy yet");
    }
  }, [incrementPoints, incrementEnergy]);

  useEffect(() => {
    const interval = setInterval(autoIncrement, 1000);
    return () => clearInterval(interval);
  }, [autoIncrement]);

  return null;
}