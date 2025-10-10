"use client";

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES } from './AnimationConstants';

interface ScrollBehaviorsProps {
  children: React.ReactNode;
  className?: string;
}

// Smooth scroll to anchor
export const smoothScrollTo = (elementId: string, duration: number = 500) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const start = window.pageYOffset;
  const target = element.offsetTop;
  const distance = target - start;
  const startTime = performance.now();

  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  const animation = (currentTime: number) => {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutCubic(progress);
    
    window.scrollTo(0, start + distance * ease);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

// Scroll-triggered fade in
export const ScrollFadeIn: React.FC<ScrollBehaviorsProps> = ({ children, className = '' }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: TRANSFORM_VALUES.TRANSLATE_PAGE }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : TRANSFORM_VALUES.TRANSLATE_PAGE
      }}
      transition={{
        duration: ANIMATION_DURATION.SLOW / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered slide in from left
export const ScrollSlideLeft: React.FC<ScrollBehaviorsProps> = ({ children, className = '' }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -TRANSFORM_VALUES.TRANSLATE_PAGE }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        x: isInView ? 0 : -TRANSFORM_VALUES.TRANSLATE_PAGE
      }}
      transition={{
        duration: ANIMATION_DURATION.SLOW / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered slide in from right
export const ScrollSlideRight: React.FC<ScrollBehaviorsProps> = ({ children, className = '' }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: TRANSFORM_VALUES.TRANSLATE_PAGE }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        x: isInView ? 0 : TRANSFORM_VALUES.TRANSLATE_PAGE
      }}
      transition={{
        duration: ANIMATION_DURATION.SLOW / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered scale in
export const ScrollScaleIn: React.FC<ScrollBehaviorsProps> = ({ children, className = '' }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        scale: isInView ? 1 : 0.8
      }}
      transition={{
        duration: ANIMATION_DURATION.SLOW / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered scroll animations
export const StaggeredScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.1 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual item for staggered scroll
export const StaggeredItem: React.FC<ScrollBehaviorsProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: TRANSFORM_VALUES.TRANSLATE_PAGE 
        },
        visible: { 
          opacity: 1, 
          y: 0 
        },
      }}
      transition={{
        duration: ANIMATION_DURATION.SLOW / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Parallax effect (use sparingly)
export const ParallaxScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
  speed?: number;
}> = ({ children, className = '', speed = 0.5 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffsetY(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y: offsetY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
