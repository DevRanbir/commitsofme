'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils'; // Assuming this exists, otherwise standard className
import { ReactNode } from 'react';

interface BlockRevealTextProps {
    children: ReactNode;
    className?: string; // Class for the text wrapper
    blockClassName?: string; // Class for the block itself
    delay?: number;
    duration?: number;
}

export const BlockRevealText = ({
    children,
    className,
    blockClassName = 'bg-primary',
    delay = 0,
    duration = 0.5,
}: BlockRevealTextProps) => {
    return (
        <div className={cn('relative inline-block overflow-hidden', className)}>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0, delay: delay + duration }}
            >
                {children}
            </motion.div>
            <motion.div
                className={cn('absolute inset-0 z-10', blockClassName)}
                initial={{ left: 0, width: '0%' }}
                whileInView={{
                    left: ['0%', '0%', '100%'],
                    width: ['0%', '100%', '0%'],
                }}
                viewport={{ once: true }}
                transition={{
                    duration: duration * 2, // Total duration for in and out
                    times: [0, 0.5, 1], // Keyframe distribution
                    ease: 'easeInOut',
                    delay: delay,
                }}
            />
        </div>
    );
};
