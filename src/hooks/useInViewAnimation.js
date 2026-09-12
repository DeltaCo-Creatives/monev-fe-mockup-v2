import { useEffect } from 'react';
import gsap from 'gsap';

/**
 * useInViewAnimation
 *
 * Animates elements with the `.gsap-slide-up` class ONLY when they enter
 * the viewport. This is critical for performance: instead of creating
 * 20 simultaneous tweens on mount, we create at most 1-2 at any given time.
 *
 * @param {React.RefObject} containerRef - The scoping container ref
 * @param {Array} dependencies - Re-run the observer when these change (e.g. route change)
 * @param {Object} opts - Optional GSAP animation overrides
 */
export function useInViewAnimation(containerRef, dependencies = [], opts = {}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll('.gsap-slide-up');
    if (!targets.length) return;

    const animationProps = {
      y: 20,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      ...opts,
    };

    // Set initial hidden state for all targets immediately
    gsap.set(targets, { y: animationProps.y, opacity: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate this single element — no stagger cost for off-screen items
            gsap.to(entry.target, {
              y: 0,
              opacity: 1,
              duration: animationProps.duration,
              ease: animationProps.ease,
              clearProps: animationProps.clearProps,
            });
            // Stop watching — only animate once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05, // Trigger when just 5% of the element is visible
        rootMargin: '0px 0px -20px 0px', // Slightly before fully in view
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
