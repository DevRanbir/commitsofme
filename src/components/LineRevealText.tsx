'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useRef, useState, Children, ReactElement } from 'react';
import { BlockRevealText } from './BlockRevealText';

interface LineRevealTextProps {
    children: ReactNode;
    className?: string;
    wordClassName?: string;
    blockClassName?: string;
    interval?: number;
    delay?: number;
    justify?: 'start' | 'center' | 'end';
}

export const LineRevealText = ({
    children,
    className,
    blockClassName,
    interval = 0.1,
    delay = 0,
    wordClassName,
    justify = 'start'
}: LineRevealTextProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<ReactNode[][]>([]);

    const childrenArray = Children.toArray(children);

    useEffect(() => {
        const calculateLines = () => {
            if (!containerRef.current) return;

            // Get all direct span children used for measurement
            // We look for elements marked with data-measure
            const spans = Array.from(containerRef.current.querySelectorAll('[data-measure="true"]')) as HTMLElement[];
            if (spans.length === 0) return;

            const newLines: ReactNode[][] = [];
            let currentLine: ReactNode[] = [];
            let currentTop = spans[0].offsetTop;

            spans.forEach((span, index) => {
                // Check if this span is on a new line (y-position diff > tolerance)
                if (span.offsetTop > currentTop + 5) { // 5px tolerance
                    newLines.push(currentLine);
                    currentLine = [];
                    currentTop = span.offsetTop;
                }
                currentLine.push(childrenArray[index]);
            });
            if (currentLine.length > 0) newLines.push(currentLine);

            setLines(newLines);
        };

        // Initial measurement
        calculateLines();

        // Re-measure on resize
        const resizeObserver = new ResizeObserver(() => {
            // We might need to clear lines to let the measurement render show again to measure correctly?
            // Actually, if we are swapping the view, yes. 
            // Simplified: Just measure once on mount/stabilization. Dynamic resize support for this effect is complex.
            // But let's try to support it by clearing lines if width changes drastically? 
            // For now, let's stick to initial calculation to avoid flicker loop.
            // If we want to support resize, we'd need the measurement DOM to always exist (perhaps invisible absolute).
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

    // If lines are ready, render the block reveals
    if (lines.length > 0) {
        return (
            <div className={cn("w-full", className)}>
                {lines.map((line, i) => (
                    <div key={i} className={cn("flex flex-wrap", {
                        'justify-start': justify === 'start',
                        'justify-center': justify === 'center',
                        'justify-end': justify === 'end'
                    })}>
                        <BlockRevealText
                            blockClassName={blockClassName}
                            delay={delay + i * interval}
                        >
                            {line.map((word, j) => (
                                <span key={j} className="mr-[0.25em]">{word}</span>
                            ))}
                        </BlockRevealText>
                    </div>
                ))}
                {/* 
                    Hidden container to maintain size/enable re-measurement if we implemented robust resize.
                    For now, we just replace.
                */}
            </div>
        );
    }

    // Measurement Render
    return (
        <div ref={containerRef} className={cn("flex flex-wrap", className, {
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end'
        })}>
            {childrenArray.map((child, i) => (
                <span
                    key={i}
                    data-measure="true"
                    className={cn("inline-block mr-[0.25em]", wordClassName)}
                >
                    {child}
                </span>
            ))}
        </div>
    );
};
