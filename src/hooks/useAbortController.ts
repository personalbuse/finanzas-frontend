import { useEffect, useRef } from 'react';

export function useAbortController(): React.MutableRefObject<AbortController | null> {
  const ref = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    ref.current = controller;
    return () => {
      controller.abort();
      ref.current = null;
    };
  }, []);

  return ref;
}

export default useAbortController;
