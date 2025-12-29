"use client";

import { ScrollVelocity } from "@/components/ScrollVelocity";
import { Signature } from "@/components/Signature";
import Toolbar from "@/components/Toolbar";
import Footer from '@/components/Footer';
import { PortfolioData } from "@/lib/data";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SocialsClientProps {
    data: PortfolioData[];
}

export default function SocialsClient({ data }: SocialsClientProps) {
    const [isCompact, setIsCompact] = useState(false);

    const socialItems = data.filter(item => item.section === "Socials");

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
                    <span className="font-bold text-primary text-3xl mb-2 font-mono">Socials</span>
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-muted-foreground/80">Connect With Me</span>
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
                <h2 className="text-4xl md:text-6xl font-black uppercase mb-12">Network</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                    {socialItems.map((item, idx) => (
                        <Link key={idx} href={item.link || "#"} target="_blank" className="group">
                            <div className="border border-border p-8 h-full flex flex-col justify-between hover:bg-card/50 transition-colors rounded-xl">
                                <div>
                                    <h3 className="text-2xl font-bold uppercase mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">{item.description}</p>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <ArrowUpRight className="w-6 h-6 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {socialItems.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">No social links found in data.</p>
                    )}
                </div>
            </section>

            <section id="socials-footer">
                <Footer />
            </section>
        </>
    );
}
