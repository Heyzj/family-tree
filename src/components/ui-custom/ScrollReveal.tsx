import React from 'react';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** IntersectionObserver threshold */
  threshold?: number | number[];
  /** Start revealing slightly before it fully enters viewport */
  rootMargin?: string;
  /** Reveal only once */
  once?: boolean;
  /** Optional delay in ms (staggering) */
  delayMs?: number;
};

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  delayMs = 0,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If reduced motion is preferred, show immediately.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <div
      ref={ref}
      className={[
        'reveal',
        isVisible ? 'reveal--in' : 'reveal--out',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--reveal-delay' as `--${string}`]: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;

