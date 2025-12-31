'use client';
import {
  motion,
  VariantLabels,
  Target,
  TargetAndTransition,
  Transition,
  useAnimation,
} from 'motion/react';

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };
  onAnimationComplete?: () => void;
};

export function TextRoll({
  children,
  duration = 0.3,
  getEnterDelay = (i) => i * 0.03,
  getExitDelay = (i) => i * 0.03 + 0.1,
  className,
  transition = { ease: 'easeIn' },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const controls = useAnimation();

  const defaultVariants = {
    enter: {
      initial: { rotateX: 0 },
      animate: { rotateX: 90 },
    },
    exit: {
      initial: { rotateX: 90 },
      animate: { rotateX: 0 },
    },
  } as const;

  const letters = children.split('');

  const handleHover = () => {
    controls.set("initial");
    controls.start("hover");
  }

  return (
    <motion.span
      className={className}
      initial="initial"
      animate={controls}
      onMouseEnter={handleHover}
    >
      {letters.map((letter, i) => {
        return (
          <span
            key={i}
            className='relative inline-block [perspective:10000px] [transform-style:preserve-3d] [width:auto]'
            aria-hidden='true'
          >
            <motion.span
              className='absolute inline-block [backface-visibility:hidden] [transform-origin:50%_25%]'
              variants={{
                initial: (variants?.enter?.initial ?? defaultVariants.enter.initial) as any,
                hover: (variants?.enter?.animate ?? defaultVariants.enter.animate) as any,
              }}
              transition={{
                ...transition,
                duration,
                delay: getEnterDelay(i),
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
            <motion.span
              className='absolute inline-block [backface-visibility:hidden] [transform-origin:50%_100%]'
              variants={{
                initial: (variants?.exit?.initial ?? defaultVariants.exit.initial) as any,
                hover: (variants?.exit?.animate ?? defaultVariants.exit.animate) as any,
              }}
              transition={{
                ...transition,
                duration,
                delay: getExitDelay(i),
              }}
              onAnimationComplete={
                letters.length === i + 1 ? onAnimationComplete : undefined
              }
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
            <span className='invisible'>
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          </span>
        );
      })}
      <span className='sr-only'>{children}</span>
    </motion.span>
  );
}
