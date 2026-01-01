"use client";

import { ScrollVelocity } from "@/components/ScrollVelocity";
import { Signature } from "@/components/Signature";
import Toolbar, { ToolbarItem } from "@/components/Toolbar";
import Footer from '@/components/Footer';
import { PortfolioData } from "@/lib/data";
import { BlockRevealText } from "./BlockRevealText";
import { LineRevealText } from "./LineRevealText";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { Loader2, Home, User, Share2 } from "lucide-react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Particles from "@/components/Particles";

const ResumeViewer = dynamic(() => import("@/components/ResumeViewer").then(mod => mod.ResumeViewer), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] flex items-center justify-center bg-muted/20 rounded-xl border border-border/50">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
        </div>
    )
});

interface AboutClientProps {
    data: PortfolioData[];
}

export default function AboutClient({ data }: AboutClientProps) {
    const [isCompact, setIsCompact] = useState(false);

    // Lottie State
    const [lottieData, setLottieData] = useState(null);
    const [isNameHovered, setIsNameHovered] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    const aboutItems = data.filter(item => item.section === "About");

    // Toolbar Items for About Page
    const aboutToolbarItems: ToolbarItem[] = [
        { id: "home", title: "Top", icon: Home },
        { id: "content-start", title: "Story", icon: User },
        { id: "socials-footer", title: "Socials", icon: Share2 },
    ];

    useEffect(() => {
        fetch("/liquid%20loader%2001.json")
            .then(res => res.json())
            .then(data => setLottieData(data))
            .catch(err => console.error("Failed to load Lottie:", err));
    }, []);

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(isNameHovered ? 1 : 0.5);
        }
    }, [isNameHovered, lottieData]);

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
                {/* Navbar */}
                <nav className="fixed z-50 pointer-events-none flex flex-col justify-between items-center inset-0 md:inset-x-0 md:top-[-1.25rem] md:bottom-auto md:flex-row md:items-start md:p-8">
                    <div
                        className="pointer-events-auto pt-6 md:pt-0 flex items-center transition-all duration-300 group cursor-pointer gap-4"
                        onMouseEnter={() => setIsNameHovered(true)}
                        onMouseLeave={() => setIsNameHovered(false)}
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                            {lottieData && (
                                <Lottie
                                    lottieRef={lottieRef}
                                    animationData={lottieData}
                                    loop={true}
                                    className="w-full h-full scale-150"
                                    onLoadedImages={() => {
                                        lottieRef.current?.setSpeed(0.2);
                                    }}
                                />
                            )}
                        </div>

                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: isNameHovered ? "auto" : 0,
                                opacity: isNameHovered ? 1 : 0
                            }}
                            className="overflow-hidden whitespace-nowrap flex flex-col items-start leading-none"
                        >
                            <span className="font-bold tracking-tighter uppercase font-mono text-lg md:text-xl">Ranbir</span>
                            <span className="font-bold tracking-tighter uppercase font-mono text-lg md:text-xl text-primary">Khurana</span>
                        </motion.div>
                    </div>

                    <div className="pointer-events-auto pb-6 md:pb-0">
                        <Toolbar items={aboutToolbarItems} />
                    </div>
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
                        <ScrollVelocity texts={["Ranbir", "Khurana"]} velocity={50} className="text-[12vw] md:text-[14vw] font-black uppercase text-foreground/40 leading-none py-4" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-30"></div>
            </div>

            <section id="content-start" className="min-h-screen bg-background py-20 px-4 md:px-12 flex flex-col items-center relative">
                {/* Particles Container - Sticky to cover viewport while scrolling this section */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="sticky top-0 h-screen w-full overflow-hidden">
                        <Particles
                            className="w-full h-full"
                            particleCount={200}
                            particleSpread={10}
                            speed={0.1}
                            particleColors={["#ffffff", "#cccccc"]}
                            moveParticlesOnHover={true}
                            alphaParticles={true}
                            disableRotation={true}
                        />
                    </div>
                </div>

                <div className="max-w-4xl w-full space-y-16 relative z-10">
                    {aboutItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
                            <h2 className="text-3xl md:text-5xl font-serif italic text-primary shrink-0 w-full md:w-1/3 text-left md:text-right flex flex-wrap justify-start md:justify-end">
                                {item.title.split(" ").map((word, i) => (
                                    <BlockRevealText key={i} delay={i * 0.1} blockClassName="bg-primary" className="mr-[0.25em]">
                                        {word}
                                    </BlockRevealText>
                                ))}
                            </h2>
                            <div className="text-lg md:text-xl text-muted-foreground leading-relaxed w-full md:w-2/3">
                                <LineRevealText>
                                    {item.description.split(" ").map((word, i) => (
                                        <span key={i} className="inline-block mr-[0.25em]">{word}</span>
                                    ))}
                                </LineRevealText>
                            </div>
                        </div>
                    ))}
                    {aboutItems.length === 0 && (
                        <p className="text-center text-muted-foreground">About section content coming soon...</p>
                    )}

                    {/* Resume Section */}
                    {(() => {
                        const resumeItem = data.find(item =>
                            (item.section?.trim().toLowerCase() === 'resume') ||
                            (item.title?.trim().toLowerCase() === 'resume')
                        );

                        if (resumeItem && resumeItem.link) {
                            return (
                                <div className="w-full mt-20">
                                    <h2 className="text-3xl md:text-5xl font-serif italic text-primary text-center mb-12">
                                        <BlockRevealText delay={0.2}>My Resume</BlockRevealText>
                                    </h2>
                                    <ResumeViewer url={resumeItem.link} />
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })()}

                </div>
            </section>

            <section id="socials-footer">
                <Footer />
            </section>
        </>
    );
}
