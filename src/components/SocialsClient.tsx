"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollVelocity } from "@/components/ScrollVelocity";
import { Signature } from "@/components/Signature";
import Toolbar, { ToolbarItem } from "@/components/Toolbar";
import Footer from '@/components/Footer';
import { BlockRevealText } from "./BlockRevealText";
import { TextRoll } from "./TextRoll";
import { GithubProfile } from "@/actions/github";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useRouter } from "next/navigation";
import {
    Home, Share2, Mail, ArrowUpRight, Github, Instagram, Linkedin, MessageCircle,
    Twitter, Youtube, Globe, Link as LinkIcon
} from "lucide-react";
import { PortfolioData } from "@/lib/data";

interface SocialsClientProps {
    data: PortfolioData[];
    githubProfile?: GithubProfile | null;
}

interface SocialLink {
    name: string;
    url: string;
    icon: any;
    color: string;
    bg: string;
}

// Map provider names to styles
const providerStyles: Record<string, { icon: any, color: string, bg: string }> = {
    github: { icon: Github, color: "#ffffff", bg: "bg-zinc-900" },
    instagram: { icon: Instagram, color: "#E1306C", bg: "bg-pink-950" },
    linkedin: { icon: Linkedin, color: "#0077b5", bg: "bg-blue-950" },
    discord: { icon: MessageCircle, color: "#5865F2", bg: "bg-indigo-950" },
    twitter: { icon: Twitter, color: "#1DA1F2", bg: "bg-sky-950" },
    youtube: { icon: Youtube, color: "#FF0000", bg: "bg-red-950" },
    mail: { icon: Mail, color: "#EA4335", bg: "bg-red-950" },
    default: { icon: Globe, color: "#888888", bg: "bg-zinc-800" }
};

export default function SocialsClient({ data, githubProfile }: SocialsClientProps) {
    const router = useRouter();
    const [isCompact, setIsCompact] = useState(false);

    // Dynamic Social Links Logic
    const [displayLinks, setDisplayLinks] = useState<SocialLink[]>([]);



    useEffect(() => {
        if (!githubProfile) {
            // Fallback if no profile
            setDisplayLinks([
                { name: "GITHUB", url: "https://github.com/devRanbir", icon: Github, color: "#ffffff", bg: "bg-zinc-900" },
                { name: "MAIL", url: "mailto:contact@example.com", icon: Mail, color: "#EA4335", bg: "bg-red-950" }
            ]);
            return;
        }

        const links: SocialLink[] = [];

        // 1. Add GitHub Profile
        links.push({
            name: "GITHUB",
            url: `https://github.com/${githubProfile.login}`,
            ...providerStyles.github
        });

        // 2. Add Email if exists
        if (githubProfile.email) {
            links.push({
                name: "MAIL",
                url: `mailto:${githubProfile.email}`,
                ...providerStyles.mail
            });
        }

        // 3. Add Blog/Website if exists
        if (githubProfile.blog) {
            let blogUrl = githubProfile.blog;
            if (!blogUrl.startsWith("http")) blogUrl = `https://${blogUrl}`;
            links.push({
                name: "WEBSITE",
                url: blogUrl,
                ...providerStyles.default,
                color: "#1db954", // Custom Green for personal site
                bg: "bg-emerald-950"
            });
        }

        // 4. Add all other social accounts
        if (githubProfile.social_accounts) {
            githubProfile.social_accounts.forEach(acc => {
                let providerKey = acc.provider.toLowerCase();
                let url = acc.url;
                if (!url.startsWith("http")) url = `https://${url}`;

                // enhanced detection based on URL
                if (url.includes("discord.gg") || url.includes("discord.com")) {
                    providerKey = "discord";
                } else if (url.includes("twitter.com") || url.includes("x.com")) {
                    providerKey = "twitter";
                } else if (url.includes("instagram.com")) {
                    providerKey = "instagram";
                } else if (url.includes("linkedin.com")) {
                    providerKey = "linkedin";
                } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    providerKey = "youtube";
                }

                const style = providerStyles[providerKey] || providerStyles.default;

                links.push({
                    name: providerKey === "generic" ? "LINK" : providerKey.toUpperCase(), // Fallback name if still generic
                    url: url,
                    icon: style.icon,
                    color: style.color,
                    bg: style.bg
                });
            });
        }

        setDisplayLinks(links);
    }, [githubProfile]);

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


    const socialsToolbarItems: ToolbarItem[] = [
        { id: "home", title: "Top", icon: Home },
        { id: "socials-list", title: "Network", icon: Share2 },
        { id: "footer", title: "End", icon: Mail },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const start = document.getElementById("socials-list");
            const footer = document.getElementById("footer");
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
                                opacity: isNameHovered ? 1 : 0,
                            }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <span className="font-bold tracking-tighter uppercase font-mono text-[1.5rem] md:text-[2rem] leading-none text-foreground">
                                Ranbir Khurana
                            </span>
                        </motion.div>
                    </div>
                    <div className="pointer-events-auto">
                        <Toolbar items={socialsToolbarItems} />
                    </div>
                </nav>

                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
                    <span className="font-bold text-primary text-3xl mb-2 font-mono">SOCIALS</span>
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-muted-foreground/80">Connect With Me</span>
                </div>

                <main className="flex-grow flex items-center justify-center relative w-full h-full z-20">
                    <div className="relative w-[90vw] md:w-[60vw] max-w-4xl aspect-[472/190]">
                        <Signature className="w-full h-full text-primary drop-shadow-[0_0_15px_rgba(231,138,83,0.3)]" />
                    </div>
                </main>

                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-0 opacity-20 select-none">
                    <div className="w-full rotate-[-5deg] scale-110">
                        <ScrollVelocity texts={["Connect", "Network"]} velocity={50} className="text-[12vw] md:text-[14vw] font-black uppercase text-foreground/40 leading-none py-4" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-30"></div>
            </div>

            <section id="socials-list" className="min-h-screen bg-background py-20 px-0 flex flex-col items-center relative overflow-hidden">
                <div className="w-full max-w-7xl mx-auto flex flex-col">
                    {displayLinks.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative w-full border-t border-white/10 last:border-b py-16 md:py-24 overflow-hidden"
                        >
                            {/* Hover Background */}
                            <div className={`absolute inset-0 ${item.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-500 ease-out`} />

                            <div className="relative z-10 px-6 md:px-12 flex items-center justify-between w-full">
                                <div className="flex items-center gap-6 md:gap-12">
                                    <span className="text-muted-foreground/30 font-mono text-xl md:text-2xl font-bold">0{idx + 1}</span>
                                    <h2 className="text-4xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter transition-transform duration-500 group-hover:translate-x-4">
                                        <TextRoll className="flex min-w-fit">{item.name}</TextRoll>
                                    </h2>
                                </div>

                                <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-10 group-hover:translate-x-0 items-center justify-center bg-white text-black p-4 rounded-full">
                                    <ArrowUpRight size={32} />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            <section id="footer">
                <Footer />
            </section>
        </>
    );
}
