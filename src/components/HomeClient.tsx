"use client";

import { ScrollVelocity } from "@/components/ScrollVelocity";
import { Signature } from "@/components/Signature";
import { HorizontalGallery } from "@/components/HorizontalGallery";
import Toolbar from "@/components/Toolbar";
import { HelmetGallery } from "@/components/HelmetGallery";
import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PortfolioData } from "@/lib/data";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface HomeClientProps {
    data: PortfolioData[];
}

export default function HomeClient({ data }: HomeClientProps) {
    const [isCompact, setIsCompact] = useState(false);
    const [lottieData, setLottieData] = useState(null);
    const [isNameHovered, setIsNameHovered] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        fetch("/liquid%20loader%2001.json")
            .then(res => res.json())
            .then(data => setLottieData(data))
            .catch(err => console.error("Failed to load Lottie:", err));
    }, []);

    useEffect(() => {
        if (lottieRef.current) {
            // Speed up on hover, slow down when idle
            lottieRef.current.setSpeed(isNameHovered ? 1 : 0.5);
        }
    }, [isNameHovered, lottieData]);

    useEffect(() => {
        const handleScroll = () => {
            const highlights = document.getElementById("highlights");
            const socials = document.getElementById("socials");
            const scrollY = window.scrollY;

            const offset = 100;

            if (highlights && socials) {
                if (scrollY >= highlights.offsetTop - offset && scrollY < socials.offsetTop - offset) {
                    setIsCompact(true);
                } else {
                    setIsCompact(false);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Filter Data
    const storyData = data.filter(item => item.section === "Story");
    // const journeyData = data.filter(item => item.section === "Journey"); // Use this for HorizontalGallery

    return (
        <>
            <div id="home" className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
                {/* Navbar */}
                <nav className="fixed -top-5 left-0 right-0 w-full flex justify-between items-start p-6 md:p-8 z-50 pointer-events-none">
                    <div
                        className="pointer-events-auto flex items-center transition-all duration-300 group cursor-pointer gap-4"
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

                    <div className="pointer-events-auto">
                        <Toolbar />
                    </div>
                </nav>

                {/* Center Top Message */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
                    <span className="font-bold text-primary text-3xl mb-2 font-mono">Home</span>
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-muted-foreground/80">
                        Welcome Traveler
                    </span>
                </div>

                {/* Main Content - Centered Signature */}
                <main className="flex-grow flex items-center justify-center relative w-full h-full z-20">
                    <div className="relative w-[90vw] md:w-[60vw] max-w-4xl aspect-[472/190]">
                        <Signature className="w-full h-full text-primary drop-shadow-[0_0_15px_rgba(231,138,83,0.3)]" />
                    </div>
                </main>

                {/* Background Scrolling Text */}
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-0 opacity-20 select-none">
                    <div className="w-full rotate-[-5deg] scale-110">
                        <ScrollVelocity
                            texts={["FULL STACK DEV", "VIBECODER"]}
                            velocity={50}
                            className="text-[12vw] md:text-[14vw] font-black uppercase text-foreground/40 leading-none py-4"
                        />
                    </div>
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-30"></div>
            </div>

            <section id="highlights">
                {/* Pass fetched data to HorizontalGallery */}
                <HorizontalGallery fetchedData={data} />
            </section>

            <section id="projects" className="min-h-screen bg-background py-12 relative z-10 px-4 md:px-12">
                <div className="max-w-[1600px] mx-auto mb-16 px-4">
                    <h2 className="text-5xl md:text-7xl font-black uppercase text-foreground mb-4 leading-[0.9]">
                        Projects <br /> <span className="text-primary font-serif italic tracking-tighter">Hall of Projects</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl text-lg mt-6">
                        From the iconic blobs to innovative one-off designs, i have always been passionate about designing innovative and memorable projects.
                    </p>
                </div>

                <HelmetGallery />

                {/* Call to Action Section */}
                <div className="w-full flex flex-col items-center justify-center pt-8 pb-20 text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-serif text-foreground leading-tight italic">
                        See more projects and highlights <br />
                        from me on the projects page
                    </h2>

                    <a
                        href="#"
                        className="group flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide rounded-[var(--radius)] text-sm hover:bg-primary/90 transition-colors"
                    >
                        View Projects
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </section>

            <section id="socials">
                <Footer />
            </section>
        </>
    );
}
