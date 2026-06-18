'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Fade-in + slide-up animation for cards
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const FadeInUp = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={fadeInUp.initial}
    animate={fadeInUp.animate}
    exit={fadeInUp.exit}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Count-up animation hook
export function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const rawProgress = Math.min((timestamp - startTime) / duration, 1);
      const progress = 1 - Math.pow(1 - rawProgress, 3); // easeOutCubic
      setCount(Math.round(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

// Pulse animation for streak calendar
export const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
};

export const PulseDiv = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div animate={pulse} className={className}>
    {children}
  </motion.div>
);
