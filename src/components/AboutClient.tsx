"use client";

import { ScrollVelocity } from "@/components/ScrollVelocity";
import { Signature } from "@/components/Signature";
import Toolbar from "@/components/Toolbar";
import Footer from '@/components/Footer';
import { PortfolioData } from "@/lib/data";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface AboutClientProps {
    data: PortfolioData[];
}

export default function AboutClient({ data }: AboutClientProps) {
    const [isCompact, setIsCompact] = useState(false);

    const aboutItems = data.filter(item => item.section === "About");

    useEffect(() => {
        const handleScroll = () => {
            const start = document.getElementById("content-start");
            const footer = document.getElementById("socials-footer");
            const scrollY = window.scrollY;
            const offset = 100;

            if (start && footer) {
                if (scrollY >= start.offsetTop - offset && scrollY < footer.offsetTop - offset) {
                    setIsCompact(true);
                } else {
                    setIsCompact(false);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div id="home" className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
                <nav className="fixed -top-5 left-0 right-0 w-full flex justify-between items-start p-6 md:p-8 z-50 pointer-events-none">
                    <motion.div
                        layout
                        className="font-bold tracking-tighter uppercase font-mono pointer-events-auto flex flex-col items-start text-[2rem]"
                        initial={{ fontSize: "2rem", flexDirection: "column", gap: "0", alignItems: "flex-start" }}
                        animate={{
                            fontSize: isCompact ? "1.5rem" : "2rem",
                            flexDirection: isCompact ? "row" : "column",
                            gap: isCompact ? "0.5rem" : "0",
                            alignItems: isCompact ? "center" : "flex-start"
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1.2 }}
                    >
                        <motion.span layout>Ranbir</motion.span>
                        <motion.span layout>Khurana</motion.span>
                    </motion.div>
                    <div className="pointer-events-auto"><Toolbar /></div>
                </nav>

                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
                    <span className="font-bold text-primary text-3xl mb-2 font-mono">About</span>
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-muted-foreground/80">More About Me</span>
                </div>

                <main className="flex-grow flex items-center justify-center relative w-full h-full z-20">
                    <div className="relative w-[90vw] md:w-[60vw] max-w-4xl aspect-[472/190]">
                        <Signature className="w-full h-full text-primary drop-shadow-[0_0_15px_rgba(231,138,83,0.3)]" />
                    </div>
                </main>

                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-0 opacity-20 select-none">
                    <div className="w-full rotate-[-5deg] scale-110">
                        <ScrollVelocity texts={["FULL STACK DEV", "VIBECODER"]} velocity={50} className="text-[12vw] md:text-[14vw] font-black uppercase text-foreground/40 leading-none py-4" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-30"></div>
            </div>

            <section id="content-start" className="min-h-screen bg-background py-20 px-4 md:px-12 flex flex-col items-center">
                <div className="max-w-4xl w-full space-y-16">
                    {aboutItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
                            <h2 className="text-3xl md:text-5xl font-serif italic text-primary shrink-0 w-full md:w-1/3 text-left md:text-right">{item.title}</h2>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed w-full md:w-2/3">
                                {item.description}
                            </p>
                        </div>
                    ))}
                    {aboutItems.length === 0 && (
                        <p className="text-center text-muted-foreground">About section content coming soon...</p>
                    )}
                </div>
            </section>

            <section id="socials-footer">
                <Footer />
            </section>
        </>
    );
}
