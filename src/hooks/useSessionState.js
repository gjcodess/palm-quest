import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { readSession, saveSessionValue } from '../utils/sessionStorage';

// Save each change immediately; background process termination may not send
// a final lifecycle event. Initial values also preserve incomplete task flags.
export const useSessionState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue;
    const saved = readSession()[key];
    if (saved === undefined || (saved === null && fallback !== null) || (fallback !== null &&
      (typeof saved !== typeof fallback || Array.isArray(saved) !== Array.isArray(fallback)))) return fallback;
    return saved;
  });
  const current = useRef(value);
  const update = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(current.current) : next;
    current.current = resolved;
    saveSessionValue(key, resolved);
    setValue(resolved);
  }, [key]);
  useLayoutEffect(() => { saveSessionValue(key, current.current); }, [key]);
  return [value, update];
};
