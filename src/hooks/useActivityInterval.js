import { useEffect, useLayoutEffect, useRef } from 'react';

// Active workstation timers resume from saved progress and stop on unmount.
export const useActivityInterval = (active, tick, delay) => {
  const callback = useRef(tick);
  useLayoutEffect(() => { callback.current = tick; });
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => callback.current(), delay);
    return () => clearInterval(timer);
  }, [active, delay]);
};
