'use client';

import { MotionConfig, motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

export function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.42, delay, ease: EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function PageEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function StaggerItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.36, delay: index * 0.06, ease: EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
