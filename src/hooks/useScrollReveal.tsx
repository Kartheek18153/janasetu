import { useEffect, useRef, useState, ReactNode, RefObject } from 'react';

type RevealVariant = 'slide-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';

const variantFrom: Record<RevealVariant, string> = {
  'slide-up': 'translate-y-8 opacity-0',
  'fade-in': 'opacity-0',
  'scale-in': 'scale-95 opacity-0',
  'slide-left': '-translate-x-8 opacity-0',
  'slide-right': 'translate-x-8 opacity-0',
};

const variantTo: Record<RevealVariant, string> = {
  'slide-up': 'translate-y-0 opacity-100',
  'fade-in': 'opacity-100',
  'scale-in': 'scale-100 opacity-100',
  'slide-left': 'translate-x-0 opacity-100',
  'slide-right': 'translate-x-0 opacity-100',
};

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  variant = 'slide-up',
  once = true,
}: {
  threshold?: number;
  rootMargin?: string;
  variant?: RevealVariant;
  once?: boolean;
} = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

interface RevealProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  variant?: RevealVariant;
  delay?: number;
  once?: boolean;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'span' | 'header' | 'footer';
  style?: React.CSSProperties;
}

export default function Reveal({
  children,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  variant = 'slide-up',
  delay = 0,
  once = true,
  className = '',
  as: Tag = 'div',
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const delayStyle: React.CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <Tag
      ref={ref as any}
      className={`transition-all duration-700 ease-out ${
        isVisible ? variantTo[variant] : variantFrom[variant]
      } ${className}`}
      style={{ ...delayStyle, ...style }}
    >
      {children}
    </Tag>
  );
}

// ─── Global auto-reveal for entire pages ────────────────────────

const AUTO_SELECTOR = 'section, [data-reveal], .auto-reveal-children > *, .space-y-6 > *';

export function useGlobalReveal(containerRef: RefObject<HTMLElement | null>, deps: any[] = []) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(AUTO_SELECTOR);
    if (targets.length === 0) return;

    const windowHeight = window.innerHeight;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.remove('reveal');
            el.classList.add('revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowHeight + 60) {
        el.classList.add('revealed');
      } else {
        el.classList.add('reveal');
        observer.observe(el);
      }
    });
  }, deps);
}
