import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import Particles from "./Particles";
import Image from "next/image";
import { Signature } from "@/components/Signature";
import { ArrowRight } from "lucide-react";
import { PortfolioData } from "@/lib/data";
import { TextRoll } from "./TextRoll";
import { BlockRevealText } from "./BlockRevealText";
import { LineRevealText } from "./LineRevealText";
import { cn } from "@/lib/utils";

// ... (CardType, cardLayouts, defaultCards, GalleryCard definitions remain unchanged)
type CardType = {
    id: number;
    type: "image" | "text";
    src?: string;
    title?: string;
    subtitle?: string;
    link?: string;
    content?: React.ReactNode;
    buttons?: string[];
    rotation: string;
    width: string;
    height: string;
    alignment: string;
};

// Layout configurations Recycled
const cardLayouts = [
    { rotation: "rotate-[-2deg]", width: "w-[85vw] md:w-[25vw]", height: "h-[45vh] md:h-[50vh]", alignment: "self-center md:self-start" },
    { rotation: "rotate-[3deg]", width: "w-[85vw] md:w-[30vw]", height: "h-[40vh] md:h-[40vh]", alignment: "self-center md:self-end" },
    { rotation: "rotate-[-1deg]", width: "w-[85vw] md:w-[35vw]", height: "h-[50vh] md:h-[60vh]", alignment: "self-center md:self-start" },
    { rotation: "rotate-[2deg]", width: "w-[75vw] md:w-[25vw]", height: "h-[40vh] md:h-[45vh]", alignment: "self-center md:self-end" },
    { rotation: "rotate-[-3deg]", width: "w-[85vw] md:w-[28vw]", height: "h-[45vh] md:h-[50vh]", alignment: "self-center md:self-start" },
    { rotation: "rotate-[1deg]", width: "w-[75vw] md:w-[22vw]", height: "h-[35vh] md:h-[40vh]", alignment: "self-center md:self-end" },
];

const defaultCards: CardType[] = [
    {
        id: 1,
        type: "image",
        src: "https://images.unsplash.com/photo-1698506648742-1e91307b27fa?q=80&w=1000&auto=format&fit=crop",
        title: "QATAR, 2024",
        rotation: "rotate-[-2deg]",
        width: "w-[85vw] md:w-[25vw]",
        height: "h-[45vh] md:h-[50vh]",
        alignment: "self-start",
    },
];

const GalleryCard = ({ card, isMobile }: { card: CardType; isMobile: boolean }) => {
    // Random position for the link button
    const [randomPos, setRandomPos] = useState<{ v: 'top' | 'bottom', h: 'left' | 'right' }>({ v: 'bottom', h: 'left' });

    useEffect(() => {
        const allowedPositions: { v: 'top' | 'bottom', h: 'left' | 'right' }[] = [
            { v: 'top', h: 'right' },
            { v: 'bottom', h: 'left' },
            { v: 'bottom', h: 'right' }
        ];
        const random = allowedPositions[Math.floor(Math.random() * allowedPositions.length)];
        setRandomPos(random);
    }, []);

    const linkLabel = card.link?.includes('github.com') ? 'GitHub' : 'View Project';

    return (
        <div
            className={cn(
                "relative flex-shrink-0 group transition-transform duration-500 hover:scale-[1.02] hover:z-20 my-4 md:my-0",
                card.width,
                card.height,
                !isMobile && card.rotation,
                card.alignment,
                isMobile ? "flex flex-col" : "block"
            )}
        >
            <div className={cn(
                "font-bold tracking-widest uppercase text-muted-foreground/80",
                isMobile ? "mb-2 text-[10px] self-start" : "absolute -top-8 left-0 text-[10px] md:text-xs"
            )}>
                <BlockRevealText>{card.title}</BlockRevealText>
            </div>

            <div className="relative w-full h-full overflow-hidden bg-muted/5 dark:bg-card/5 backdrop-blur-sm border border-white/10 p-2 md:p-3 flex flex-col grow">
                {card.type === "image" && card.src ? (
                    <div className="relative w-full h-full  overflow-hidden">
                        <Image
                            src={card.src}
                            alt={card.title || "Gallery Image"}
                            fill
                            className="object-cover object-left grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-between p-4 md:p-8 bg-card/10">
                        <div>
                            {card.subtitle && (
                                <h3 className="text-2xl md:text-4xl font-serif leading-tight text-foreground">
                                    <LineRevealText>
                                        {card.subtitle.split(" ").map((word, i) => (
                                            word.toLowerCase() === "where" || word.toLowerCase() === "how" ? (
                                                <span key={i} className="font-bold italic text-primary">
                                                    {word}
                                                </span>
                                            ) : (
                                                <span key={i} className="text-foreground">{word}</span>
                                            )
                                        ))}
                                    </LineRevealText>
                                </h3>
                            )}
                            {card.content}
                        </div>

                        <div className="flex flex-wrap gap-3 mt-6">
                            {card.buttons?.map((btn, idx) => (
                                <button
                                    key={idx}
                                    className="flex items-center gap-2 px-5 py-2 rounded-full border border-foreground/20 text-xs font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
                                >
                                    <TextRoll className="flex min-w-fit">{btn}</TextRoll>
                                    {idx === 0 && <ArrowRight size={12} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Link Button */}
            {card.link && (
                <div
                    className={cn(
                        "z-30 pointer-events-auto w-max",
                        isMobile
                            ? "mt-4 self-end relative"
                            : `absolute ${randomPos.h === 'left' ? 'left-0' : 'right-0'} ${randomPos.v === 'top' ? '-top-10' : '-bottom-10'}`
                    )}
                >
                    <a
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md rounded-full text-foreground hover:text-primary transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:scale-105"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            <TextRoll className="flex min-w-fit">{linkLabel}</TextRoll>
                        </span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" />
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
};

export const HorizontalGallery = ({ fetchedData }: { fetchedData?: PortfolioData[] }) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // 768px matches 'md' breakpoint in Tailwind
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    // Handle horizontal scroll on trackpads (Desktop Only)
    useEffect(() => {
        if (isMobile) return; // Disable horizontal scroll hijacking on mobile

        const element = targetRef.current;
        if (!element) return;

        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                window.scrollBy(0, e.deltaX);
            }
        };

        element.addEventListener("wheel", onWheel, { passive: false });
        return () => element.removeEventListener("wheel", onWheel);
    }, [isMobile]);

    // Process fetched data
    let displayCards: CardType[] = defaultCards;

    if (fetchedData && fetchedData.length > 0) {
        const journeyItems = fetchedData.filter(item => item.section === "Journey");

        if (journeyItems.length > 0) {
            displayCards = journeyItems.map((item, index) => {
                const layout = cardLayouts[index % cardLayouts.length];
                const isImage = !!item.image;
                const type = isImage ? "image" : "text";

                // For text cards on mobile, use auto height to reduce whitespace
                // Keep the desktop height (md:...) from the original layout
                const adjustedHeight = isImage
                    ? layout.height
                    : "h-auto min-h-[250px] " + layout.height.substring(layout.height.indexOf("md:"));

                return {
                    id: index + 100,
                    type: type as "image" | "text",
                    src: item.image,
                    title: item.title,
                    subtitle: item.description,
                    link: item.link,
                    buttons: item.link ? [] : [],
                    ...layout,
                    height: adjustedHeight
                };
            });
        }
    }

    return (
        <section
            ref={targetRef}
            className={cn(
                "relative bg-background",
                isMobile ? "min-h-screen h-auto" : "h-[300vh]"
            )}
        >
            <div className={cn(
                "w-full overflow-hidden",
                isMobile ? "relative h-auto pt-20" : "sticky top-0 h-screen"
            )}>
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <Particles
                        particleColors={['#d87943', '#ffffff']}
                        particleCount={200}
                        particleSpread={10}
                        speed={0.1}
                        particleBaseSize={100}
                        moveParticlesOnHover={false}
                        alphaParticles={true}
                        disableRotation={false}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: isMobile ? 0 : 100, y: 100 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                        "w-full flex",
                        isMobile ? "flex-col h-auto items-center pb-20" : "h-full items-center"
                    )}
                >
                    <motion.div
                        style={{ x: isMobile ? 0 : x }}
                        className={cn(
                            "flex items-center",
                            isMobile ? "flex-col gap-8 px-4" : "gap-12 md:gap-32 pl-[10vw] pr-[10vw] h-full md:items-stretch py-20"
                        )}
                    >
                        {/* Introductory Text Block */}
                        <div className={cn(
                            "shrink-0 flex flex-col justify-center",
                            isMobile ? "w-full text-center items-center mb-6" : "w-[30vw] mr-16 self-center items-start"
                        )}>
                            <h2 className={cn(
                                "text-6xl md:text-8xl font-black text-primary uppercase leading-none mb-6 flex flex-col",
                                isMobile ? "items-center" : "items-start"
                            )}>
                                <BlockRevealText delay={0}>Limits</BlockRevealText>
                                <BlockRevealText delay={0.2}>Define</BlockRevealText>
                                <BlockRevealText delay={0.4} className="text-foreground" blockClassName="bg-foreground">
                                    Nothing
                                </BlockRevealText>
                            </h2>
                            <div className={cn(
                                "text-muted-foreground text-lg md:text-xl max-w-md",
                                isMobile ? "text-center px-2" : ""
                            )}>
                                <LineRevealText>
                                    {"Pushing past barriers and setting new standards on and off the track.".split(" ").map((word, i) => (
                                        <span key={i} className="inline-block mr-[0.25em]">{word}</span>
                                    ))}
                                </LineRevealText>
                            </div>
                        </div>

                        {displayCards.map((card) => (
                            <GalleryCard key={card.id} card={card} isMobile={isMobile} />
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
