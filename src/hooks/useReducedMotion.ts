import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Tracks the system Reduce Motion setting without blocking first render. */
export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setIsReduced(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return isReduced;
}
