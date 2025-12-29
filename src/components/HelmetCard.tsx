"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming utils exists, if not i'll remove clsx

const HelmetCardBorder = ({ className }: { className?: string }) => (
    <svg
        className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M1 12C1 5.92487 5.92487 1 12 1H288C294.075 1 299 5.92487 299 12V248C299 254.075 294.275 259 288.2 259H195C185 259 180 263 175 270L170 278C165 285 160 289 150 289H12C5.92487 289 1 284.075 1 278V12Z"
            stroke="#333"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
        />
        {/* Another path for the "Tab" line if needed, or just relying on the stroke above.*/}
    </svg>
);


import { FastAverageColor } from 'fast-average-color';
import { useEffect, useState } from "react";

export const HelmetCard = ({
    src,
    title,
    year,
    description,
    link,
    repoUrl,
    demoUrl,
    className,
}: {
    src: string;
    title: string;
    year: string;
    description?: string;
    link?: string;
    repoUrl?: string;
    demoUrl?: string;
    className?: string;
}) => {
    const [bgColor, setBgColor] = useState("#000000"); // Default to black
    const [isHovered, setIsHovered] = useState(false);
    const [randomPos, setRandomPos] = useState<'top' | 'bottom'>('bottom');

    useEffect(() => {
        setRandomPos(Math.random() > 0.5 ? 'top' : 'bottom');
    }, []);

    useEffect(() => {
        const fac = new FastAverageColor();

        // Use Next.js image optimization endpoint as a proxy to bypass CORS
        // We request a small width (w=64) for faster color extraction
        const proxyUrl = `/_next/image?url=${encodeURIComponent(src)}&w=64&q=75`;

        fac.getColorAsync(proxyUrl, { algorithm: 'dominant' })
            .then(color => {
                setBgColor(color.hex);
            })
            .catch(e => {
                // Return to default black if fails
                console.debug("Average color failed", e);
            });

        return () => {
            fac.destroy();
        };
    }, [src]);

    const linkLabel = link?.includes('github.com') ? 'GitHub' : 'View';

    return (
        <div
            className={cn("relative w-full h-full group overflow-hidden cursor-pointer", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Random Link Button - Visible always (or on hover? User implies always or parallel to repoUrl logic) */}
            {/* User said 'show a button', implies visibility. I'll make it always visible or consistent with card aesthetic. */}
            {link && (
                <div
                    className={cn(
                        "absolute left-4 z-30 pointer-events-auto",
                        randomPos === 'top' ? "top-4" : "bottom-20 md:bottom-24" // Avoid overlapping with label area (bottom right) and potentially description curtain
                    )}
                >
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-primary hover:border-primary transition-all duration-300 group-hover:scale-105"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">{linkLabel}</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" />
                        </svg>
                    </a>
                </div>
            )}

            {/* Clipped Card content */}
            <div
                className="absolute inset-0 bg-card overflow-hidden"
                style={{
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 90%, 45% 90%, 35% 100%, 0% 100%)"
                }}
            >
                {/* Main Image Layer */}
                <div
                    className="absolute inset-0 z-0 flex items-center justify-center transition-colors duration-500"
                    style={{ backgroundColor: bgColor }}
                >
                    <div className="relative w-full h-full">
                        <Image
                            src={src}
                            alt={title}
                            fill
                            // unoptimized prop removed to allow Next.js proxying which fixes CORS for FAC
                            className={cn(
                                "object-cover object-left transition-all duration-700",
                                isHovered ? "scale-105 blur-[2px] opacity-40" : "scale-100 opacity-100"
                            )}
                            crossOrigin="anonymous" // Hint for FAC if it accesses the element
                        />
                    </div>
                </div>

                {/* Curtain Overlay */}
                <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 ease-in-out"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        transform: isHovered ? "translateY(0%)" : "translateY(-100%)",
                        // "Curtain" effect can be simple slide down or a mask. 
                        // User asked for "U shape". We can use a mask or just border-radius.
                        // Let's try a slide down with a bottom radius that flattens.
                        borderBottomLeftRadius: isHovered ? "0" : "50%",
                        borderBottomRightRadius: isHovered ? "0" : "50%",
                    }}
                >
                    <p className="text-white text-sm md:text-base font-medium mb-6 line-clamp-4 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {description || "No description available."}
                    </p>

                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        {repoUrl && (
                            <a
                                href={repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-white hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                GitHub
                                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" />
                                </svg>
                            </a>
                        )}
                        {demoUrl && (
                            <a
                                href={demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-transparent border border-white text-white text-xs font-bold uppercase rounded-full hover:bg-white hover:text-black transition-colors"
                            >
                                Live Demo
                            </a>
                        )}
                    </div>
                </div>

            </div>

            {/* Label Area - Positioned in the empty cut-out space (Bottom Right) */}
            <div className="absolute bottom-1 right-2 z-20 flex flex-row items-center gap-2 justify-end pointer-events-none">
                <span className="font-bold text-foreground/60 text-[10px] md:text-sm tracking-widest uppercase">{title}</span>
                <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary pointer-events-auto hover:opacity-80 transition-opacity"
                >
                    <span className="font-bold text-xl md:text-3xl tracking-tighter">{year}</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" />
                    </svg>
                </a>
            </div>
        </div>
    );
};
