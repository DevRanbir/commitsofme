"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import './Masonry.css';

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
    const get = () => {
        if (typeof window === 'undefined') return defaultValue;
        return values[queries.findIndex(q => window.matchMedia(q).matches)] ?? defaultValue;
    };

    const [value, setValue] = useState<number>(get);

    useEffect(() => {
        const handler = () => setValue(get);
        queries.forEach(q => window.matchMedia(q).addEventListener('change', handler));
        return () => queries.forEach(q => window.matchMedia(q).removeEventListener('change', handler));
    }, [queries]);

    return value;
};

const useMeasure = <T extends HTMLElement>() => {
    const ref = useRef<T | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    return [ref, size] as const;
};

export interface Item {
    id: string;
    img: string;
    url?: string;
    height: number;
    title?: string;
    year?: string;
    description?: string;
    demoUrl?: string;
}

interface GridItem extends Item {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface MasonryProps {
    items: Item[];
    ease?: string;
    duration?: number;
    stagger?: number;
    animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
    scaleOnHover?: boolean;
    hoverScale?: number;
    blurToFocus?: boolean;
    colorShiftOnHover?: boolean;
    renderItem?: (item: Item, style: React.CSSProperties) => React.ReactNode;
    columns?: number;
}

const Masonry: React.FC<MasonryProps> = ({
    items,
    ease = 'power3.out',
    duration = 0.6,
    stagger = 0.05,
    animateFrom = 'bottom',
    scaleOnHover = true,
    hoverScale = 0.95,
    blurToFocus = true,
    colorShiftOnHover = false,
    renderItem,
    columns: maxColumns = 4
}) => {
    const columns = useMedia(
        ['(min-width:768px)', '(min-width:600px)', '(min-width:400px)'],
        [maxColumns, 2, 1],
        1
    );

    const [containerRef, { width }] = useMeasure<HTMLDivElement>();
    // Default to true to skip preloader for now or handle it better with next/image later
    const [imagesReady, setImagesReady] = useState(true);

    const getInitialPosition = (item: GridItem) => {
        if (typeof window === 'undefined') return { x: item.x, y: item.y };
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return { x: item.x, y: item.y };

        let direction = animateFrom;

        if (animateFrom === 'random') {
            const directions = ['top', 'bottom', 'left', 'right'];
            direction = directions[Math.floor(Math.random() * directions.length)] as typeof animateFrom;
        }

        switch (direction) {
            case 'top':
                return { x: item.x, y: -200 };
            case 'bottom':
                return { x: item.x, y: window.innerHeight + 200 };
            case 'left':
                return { x: -200, y: item.y };
            case 'right':
                return { x: window.innerWidth + 200, y: item.y };
            case 'center':
                return {
                    x: containerRect.width / 2 - item.w / 2,
                    y: containerRect.height / 2 - item.h / 2
                };
            default:
                return { x: item.x, y: item.y + 100 };
        }
    };


    const grid = useMemo<GridItem[]>(() => {
        if (!width) return [];


        const waveOffset = 120; // Hardcoded per user request "like a wave"

        const colHeights = new Array(columns).fill(0).map((_, i) => (i % 2 === 1 ? waveOffset : 0));
        const columnWidth = width / columns;

        return items.map((child, i) => {
            // Strict mode: 1, 2, 3, 4 left to right.
            const col = i % columns;

            const x = columnWidth * col;
            const height = child.height;
            const y = colHeights[col];

            colHeights[col] += height + 40; // Add gap (increased for breathing room)

            return { ...child, x, y, w: columnWidth, h: height };
        });
    }, [columns, items, width]);

    // Calculate container height based on max column height
    const containerHeight = useMemo(() => {
        if (!width || items.length === 0) return 0;
        const waveOffset = 120;
        const colHeights = new Array(columns).fill(0).map((_, i) => (i % 2 === 1 ? waveOffset : 0));

        items.forEach((child, i) => {
            const col = i % columns;
            colHeights[col] += child.height + 40;
        });
        return Math.max(...colHeights);
    }, [columns, items, width]);


    const hasMounted = useRef(false);

    // Reset mounted flag when items change
    useEffect(() => {
        hasMounted.current = false;
    }, [items]);

    useLayoutEffect(() => {
        if (!imagesReady || grid.length === 0) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // 1. Initial State: Hide and offset ALL items
            // Using autoAlpha handles opacity + visibility to prevent interaction when hidden
            gsap.set(".masonry-item", { y: 100, autoAlpha: 0 });

            // 2. Batch Animation
            ScrollTrigger.batch(".masonry-item", {
                start: "top 85%", // Trigger when item top reaches 85% of viewport height
                onEnter: batch => gsap.to(batch, {
                    autoAlpha: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power3.out",
                    overwrite: true
                }),
                onLeave: batch => gsap.to(batch, {
                    autoAlpha: 0,
                    y: -100, // Float UP when scrolling past? Or just fade out? User said "animation from below to upwards". 
                    // Usually removing layout is weird. Let's just fade out or move up.
                    // Actually, standard "in view" behavior:
                    // Enter bottom: start Y=100 -> Y=0.
                    // Leave top: start Y=0 -> Y=-100.
                    overwrite: true
                }),
                onEnterBack: batch => gsap.to(batch, {
                    autoAlpha: 1,
                    y: 0,
                    stagger: 0.1,
                    overwrite: true
                }),
                onLeaveBack: batch => gsap.to(batch, {
                    autoAlpha: 0,
                    y: 100, // Move back down when leaving bottom
                    overwrite: true
                })
            });

            ScrollTrigger.refresh();
        }, containerRef);

        return () => ctx.revert();
    }, [grid, imagesReady]);

    const handleMouseEnter = (e: React.MouseEvent, item: GridItem) => {
        const element = e.currentTarget as HTMLElement;
        const selector = `[data-key="${item.id}"]`;

        if (scaleOnHover) {
            // Apply scale to inner content if possible to avoid layout shifting, but user asked for this code
            gsap.to(selector, {
                zIndex: 10,
                scale: hoverScale,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    const handleMouseLeave = (e: React.MouseEvent, item: GridItem) => {
        const selector = `[data-key="${item.id}"]`;

        if (scaleOnHover) {
            gsap.to(selector, {
                zIndex: 1,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    return (
        <div ref={containerRef} className="list" style={{ height: containerHeight }}>
            {grid.map(item => {
                return (
                    <div
                        key={item.id}
                        className="masonry-item absolute"
                        data-key={item.id}
                        data-masonry-item="true"
                        style={{
                            width: item.w,
                            height: item.h,
                            top: item.y,
                            left: item.x
                        }}
                    >
                        <div
                            className="item-wrapper w-full h-full"
                            onMouseEnter={e => handleMouseEnter(e, item)}
                            onMouseLeave={e => handleMouseLeave(e, item)}
                        >
                            {renderItem ? renderItem(item, { width: '100%', height: '100%' }) : (
                                <div
                                    className="item-img bg-cover bg-center w-full h-full rounded-xl"
                                    style={{ backgroundImage: `url(${item.img})` }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Masonry;
