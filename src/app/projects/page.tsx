"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ScrollVelocity } from "@/components/ScrollVelocity";
import { Signature } from "@/components/Signature";
import Toolbar, { ToolbarItem } from "@/components/Toolbar";
import Footer from '@/components/Footer';
import InfiniteMenu, { MenuItem } from "@/components/InfiniteMenu";
import { HelmetGallery } from "@/components/HelmetGallery";
import { getGithubProjects } from "@/actions/github";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { Home, Sparkles, FolderOpen, Share2 } from "lucide-react";

export default function Projects() {
    const [isCompact, setIsCompact] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // Lottie State
    const [lottieData, setLottieData] = useState(null);
    const [isNameHovered, setIsNameHovered] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Initial load of Lottie data
    useEffect(() => {
        fetch("/liquid%20loader%2001.json")
            .then(res => res.json())
            .then(data => setLottieData(data))
            .catch(err => console.error("Failed to load Lottie:", err));
    }, []);

    // Control Lottie speed on hover
    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(isNameHovered ? 1 : 0.5);
        }
    }, [isNameHovered, lottieData]);

    // Toolbar Items for Projects Page
    const projectToolbarItems: ToolbarItem[] = [
        { id: "home", title: "Top", icon: Home },
        { id: "content-start", title: "Featured", icon: Sparkles },
        { id: "repository", title: "Repository", icon: FolderOpen },
        { id: "socials", title: "Socials", icon: Share2 },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const highlights = document.getElementById("content-start");
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

        // Fetch projects
        getGithubProjects().then(projects => {
            setMenuItems(projects);
        });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                        <Toolbar items={projectToolbarItems} />
                    </div>
                </nav>

                {/* Center Top Message */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
                    <span className="font-bold text-primary text-3xl mb-2 font-mono">Projects</span>
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-muted-foreground/80">
                        Showcasing Project Work
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
                            texts={["Fantastic","PROJECTS"]}
                            velocity={50}
                            className="text-[12vw] md:text-[14vw] font-black uppercase text-foreground/40 leading-none py-4"
                        />
                    </div>
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-30"></div>
            </div>

            <section id="content-start" className="min-h-screen bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>
                <div style={{ height: '800px', position: 'relative', width: '100%', zIndex: 10 }}>
                    {menuItems.length > 0 ? (
                        <InfiniteMenu items={menuItems} />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Loading projects...
                        </div>
                    )}
                </div>
            </section>

            <section id="repository" className="min-h-screen bg-background relative z-10 px-4 md:px-12 py-20">
                <div className="max-w-[1600px] mx-auto">
                    <HelmetGallery projects={menuItems} />
                </div>
            </section>

            <section id="socials">
                <Footer />
            </section>
        </>
    );
}
