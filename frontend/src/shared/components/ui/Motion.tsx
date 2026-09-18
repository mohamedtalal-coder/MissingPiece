import type { ReactNode, CSSProperties } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type MotionPreset = 'fade' | 'up' | 'down';

interface MotionProps {
  children: ReactNode;
  className?: string;
  preset?: MotionPreset;
  delayMs?: number;
}

const presetClass: Record<MotionPreset, string> = {
  fade: 'motion-fade',
  up: 'motion-up',
  down: 'motion-down',
};

/** Scroll-triggered entrance; skipped when user prefers reduced motion. */
export function Motion({ children, className = '', preset = 'up', delayMs = 0 }: MotionProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();

  const style: CSSProperties | undefined =
    !reduced && delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined;

  return (
    <div
      ref={ref}
      style={style}
      className={`${reduced ? '' : presetClass[preset]} ${inView || reduced ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

interface StaggerProps {
  children: ReactNode[];
  className?: string;
  stepMs?: number;
}

/** Staggered entrance for a list of nodes (e.g. product grid cells). */
export function Stagger({ children, className = '', stepMs = 60 }: StaggerProps) {
  const reduced = useReducedMotion();

  return (
    <div className={className}>
      {children.map((child, index) => (
        <Motion key={index} preset="up" delayMs={reduced ? 0 : index * stepMs} className="h-full">
          {child}
        </Motion>
      ))}
    </div>
  );
}
