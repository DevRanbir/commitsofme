"use client";

import React from 'react';
import LogoLoop, { LogoItem } from './LogoLoop';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Signature } from './Signature';

const partnerLogos: LogoItem[] = [
    { src: "https://skillicons.dev/icons?i=react&theme=dark", alt: "React", href: "https://react.dev" },
    { src: "https://skillicons.dev/icons?i=nextjs&theme=dark", alt: "Next.js", href: "https://nextjs.org" },
    { src: "https://skillicons.dev/icons?i=typescript&theme=dark", alt: "TypeScript", href: "https://www.typescriptlang.org" },
    { src: "https://skillicons.dev/icons?i=javascript&theme=dark", alt: "JavaScript", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { src: "https://skillicons.dev/icons?i=nodejs&theme=dark", alt: "Node.js", href: "https://nodejs.org" },
    { src: "https://skillicons.dev/icons?i=html&theme=dark", alt: "HTML5", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { src: "https://skillicons.dev/icons?i=css&theme=dark", alt: "CSS3", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { src: "https://skillicons.dev/icons?i=tailwind&theme=dark", alt: "Tailwind CSS", href: "https://tailwindcss.com" },
    { src: "https://skillicons.dev/icons?i=python&theme=dark", alt: "Python", href: "https://www.python.org" },
    { src: "https://skillicons.dev/icons?i=java&theme=dark", alt: "Java", href: "https://www.java.com" },
    { src: "https://skillicons.dev/icons?i=cpp&theme=dark", alt: "C++", href: "https://isocpp.org" },
    { src: "https://skillicons.dev/icons?i=firebase&theme=dark", alt: "Firebase", href: "https://firebase.google.com" },
    { src: "https://skillicons.dev/icons?i=mongodb&theme=dark", alt: "MongoDB", href: "https://www.mongodb.com" },
    { src: "https://skillicons.dev/icons?i=mysql&theme=dark", alt: "MySQL", href: "https://www.mysql.com" },
    { src: "https://skillicons.dev/icons?i=git&theme=dark", alt: "Git", href: "https://git-scm.com" },
    { src: "https://skillicons.dev/icons?i=github&theme=dark", alt: "GitHub", href: "https://github.com" },
    { src: "https://skillicons.dev/icons?i=vscode&theme=dark", alt: "VS Code", href: "https://code.visualstudio.com" },
    { src: "https://skillicons.dev/icons?i=docker&theme=dark", alt: "Docker", href: "https://www.docker.com" },
    { src: "https://skillicons.dev/icons?i=aws&theme=dark", alt: "AWS", href: "https://aws.amazon.com" },
];

const Footer = () => {
    return (
        <div className="relative w-full flex flex-col items-center mt-0 mb-2">
            <div
                className="relative w-[97%] aspect-[1.88] flex flex-col text-white overflow-hidden"
                style={{
                    maskImage: "url(/footermask.svg)",
                    WebkitMaskImage: "url(/footermask.svg)",
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat"
                }}
            >
                {/* Layer 1: Main Dark Background */}
                <div className="absolute inset-0 z-0 bg-[#1A1C1A]">
                    <div
                        className="absolute inset-0 bg-primary opacity-[0.1]"
                        style={{
                            maskImage: "url(/background_footer.svg)",
                            WebkitMaskImage: "url(/background_footer.svg)",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            maskSize: "cover",
                            WebkitMaskSize: "cover",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat"
                        }}
                    />
                </div>

                {/* Layer 2: Bottom Yellow Bar Background */}
                <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-primary z-0" />

                {/* Layer 3: Main Content */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between pt-[12%] pb-2 px-1 md:px-12">

                    {/* Top Section: Nav, Hero, Socials */}
                    <div className="grid grid-cols-3 gap-2 md:gap-8 items-center w-full flex-grow">
                        {/* Left: Navigation */}
                        <div className="flex flex-col items-start gap-1 md:gap-2">
                            <p className="text-white/60 text-[0.6rem] md:text-[10px] tracking-widest uppercase mb-1">PAGES</p>
                            {[
                                { name: "HOME", href: "/" },
                                { name: "PROJECTS", href: "/projects" },
                                { name: "SOCIALS", href: "/socials" },
                                { name: "ABOUT", href: "/about" }
                            ].map((link) => (
                                <a key={link.name} href={link.href} className="text-[1.8vw] md:text-4xl font-extrabold uppercase tracking-tight hover:text-primary transition-colors duration-300">
                                    {link.name}
                                </a>
                            ))}
                            <a href="#" className="mt-2 text-primary text-[1.2vw] md:text-lg font-bold uppercase tracking-wider flex items-center gap-1 hover:brightness-110">
                                STORE
                            </a>
                        </div>

                        {/* Center: Hero Visual */}
                        <div className="relative flex flex-col items-center justify-center p-0 md:p-4">
                            <div className="relative flex flex-col items-center justify-center mb-8 md:mb-46">
                                {/* The Text Background */}
                                <div className="flex flex-col items-center leading-[0.85] pointer-events-none select-none">
                                    <span className="text-[4vw] md:text-[90px] font-black text-white/10 tracking-tighter uppercase whitespace-nowrap">ALWAYS BRINGING</span>
                                    <span className="text-[4vw] md:text-[90px] font-black text-white/10 tracking-tighter uppercase whitespace-nowrap">THE GOODNESS</span>
                                </div>

                                {/* The Signature Overlay */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[110%] z-10">
                                    <Signature className="w-[12vw] md:w-[400px] text-white -rotate-5 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                                </div>
                            </div>

                            <div className="z-20 mt-[-5px] md:mt-[-10px]">
                                <button className="bg-primary text-black font-extrabold uppercase px-3 py-1 md:px-6 md:py-2 text-[1.2vw] md:text-base rounded-full flex items-center gap-1 md:gap-2 hover:scale-105 transition-transform whitespace-nowrap">
                                    BUSINESS ENQUIRIES
                                    <ArrowUpRight size={18} className="w-[1.5vw] h-[1.5vw] md:w-[18px] md:h-[18px]" strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Socials */}
                        <div className="flex flex-col items-end gap-1 md:gap-2">
                            <p className="text-white/60 text-[0.6rem] md:text-[10px] tracking-widest uppercase mb-1">FOLLOW ON</p>
                            {["GITHUB", "INSTAGRAM", "LINKEDIN", "DISCORD"].map((link) => (
                                <a key={link} href="#" className="text-[1.8vw] md:text-4xl font-extrabold uppercase tracking-tight hover:text-primary transition-colors duration-300">
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Middle: Partner Logos - ABSOLUTELY POSITIONED IN THE ORANGE BAR AREA */}
                    <div className="absolute bottom-4 left-0 w-full h-[12%] flex items-center justify-center opacity-80 overflow-hidden mix-blend-multiply pointer-events-none">
                        <div className="w-[120%] ml-[-10%]">
                            {/* Wider width to ensure loop covers edges if mask curves */}
                            <LogoLoop
                                logos={partnerLogos}
                                speed={50}
                                direction="left"
                                logoHeight={24}
                                gap={40}
                                hoverSpeed={20}
                                scaleOnHover
                                className="grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Positioned in whitespace */}
            <div className="absolute bottom-1 w-full px-4 md:px-12 flex flex-row justify-between items-center gap-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider z-50">
                {/* Social Logs */}
                <div className="flex items-center gap-1 opacity-60">
                    <span>© 2025 ALL RIGHTS RESERVED</span>
                </div>

                {/* Credit */}
                <div className="flex items-center gap-1 opacity-60">
                    <span className="opacity-80">Made By</span>
                    <span className="font-black">DevRanbir</span>
                </div>
            </div>
        </div>
    );
};

export default Footer;
