import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialSeconds: number, onComplete: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const start = useCallback(() => {
    if (seconds > 0) {
      setIsActive(true);
    }
  }, [seconds]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((startAfterReset = false) => {
    setIsActive(false);
    setSeconds(initialSeconds);
     if (startAfterReset && initialSeconds > 0) {
      setIsActive(true);
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onComplete]);

  return { seconds, isActive, start, pause, reset };
};