
import { useState, useEffect, useMemo } from 'react';

export const useTimer = (isRunning: boolean, startDate: string) => {
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Use useMemo to parse the start date only once
  const anniversaryDate = useMemo(() => new Date(startDate), [startDate]);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning) {
      const calculateDuration = () => {
        const now = new Date();
        const differenceInSeconds = Math.floor((now.getTime() - anniversaryDate.getTime()) / 1000);
        setTotalSeconds(differenceInSeconds > 0 ? differenceInSeconds : 0);
      };
      
      calculateDuration(); // Run once immediately to prevent initial 00:00:00 display

      interval = setInterval(calculateDuration, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, anniversaryDate]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    
    return `${days} days ${hours}:${minutes}:${secs}`;
  };

  return formatTime(totalSeconds);
};
