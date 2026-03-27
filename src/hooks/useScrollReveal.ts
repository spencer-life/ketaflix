"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  direction?: "up" | "left";
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  selector?: string;
  threshold?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      direction = "up",
      distance = 24,
      duration = 600,
      delay = 0,
      stagger: staggerMs,
      selector,
      threshold = 0.1,
    } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          import("animejs").then(({ animate, stagger }) => {
            const targets = selector ? el.querySelectorAll(selector) : el;

            const translateProp =
              direction === "left" ? "translateX" : "translateY";

            animate(targets, {
              opacity: [0, 1],
              [translateProp]: [distance, 0],
              duration,
              delay: staggerMs ? stagger(staggerMs, { start: delay }) : delay,
              easing: "cubicBezier(0.33, 1, 0.68, 1)",
            });
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold },
    );

    // Set initial hidden state
    if (selector) {
      el.querySelectorAll(selector).forEach((child) => {
        (child as HTMLElement).style.opacity = "0";
      });
    } else {
      el.style.opacity = "0";
    }

    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
