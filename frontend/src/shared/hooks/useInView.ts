import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

/** Observe when an element enters the viewport (for scroll reveals). */
export function useInView<T extends HTMLElement>(
  options: UseInViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { rootMargin = '0px 0px -8% 0px', threshold = 0.12, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, inView];
}
