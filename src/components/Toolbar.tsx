"use client";
import {
    Bell,
    Briefcase,
    Home,
    Moon,
    Share2,
    Sparkles,
    Sun,
    type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ToolbarItem {
    id: string;
    title: string;
    icon: LucideIcon;
    type?: never;
}

interface ToolbarProps {
    className?: string;
    activeColor?: string;
    onSearch?: (value: string) => void;
}

const buttonVariants = {
    initial: {
        gap: 0,
        paddingLeft: ".5rem",
        paddingRight: ".5rem",
    },
    animate: (isSelected: boolean) => ({
        gap: isSelected ? ".5rem" : 0,
        paddingLeft: isSelected ? "1rem" : ".5rem",
        paddingRight: isSelected ? "1rem" : ".5rem",
    }),
};

const spanVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "auto", opacity: 1 },
    exit: { width: 0, opacity: 0 },
};

const notificationVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: -10 },
    exit: { opacity: 0, y: -20 },
};

const lineVariants = {
    initial: { scaleX: 0, x: "-50%" },
    animate: {
        scaleX: 1,
        x: "0%",
        transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
        scaleX: 0,
        x: "50%",
        transition: { duration: 0.2, ease: "easeIn" },
    },
};

const transition = { type: "spring", bounce: 0, duration: 0.4 };

export function Toolbar({
    className,
    activeColor = "text-primary",
}: ToolbarProps) {
    const [selected, setSelected] = React.useState<string | null>("home");
    const [isDark, setIsDark] = React.useState(true);
    const [activeNotification, setActiveNotification] = React.useState<
        string | null
    >(null);
    const outsideClickRef = React.useRef(null);

    const toolbarItems: ToolbarItem[] = [
        { id: "home", title: "Home", icon: Home },
        { id: "highlights", title: "Highlights", icon: Sparkles },
        { id: "projects", title: "Projects", icon: Briefcase },
        { id: "socials", title: "Socials", icon: Share2 },
    ];

    const handleItemClick = (itemId: string) => {
        setSelected(itemId);
        setActiveNotification(itemId);
        setTimeout(() => setActiveNotification(null), 1500);

        const element = document.getElementById(itemId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    React.useEffect(() => {
        const handleScroll = () => {
            const sections = toolbarItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            for (const section of sections) {
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;

                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        setSelected(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Initial theme check
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }

        // Initial scroll check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        // @ts-ignore
        if (!document.startViewTransition) {
            if (newTheme) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return;
        }

        // @ts-ignore
        document.startViewTransition(() => {
            if (newTheme) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    };

    return (
        <div className="space-y-2">
            <div
                className={cn(
                    "relative flex items-center gap-3 p-2",
                    "bg-background",
                    "rounded-xl border",
                    "transition-all duration-200",
                    className
                )}
                ref={outsideClickRef}
            >

                <div className="flex items-center gap-2">
                    {toolbarItems.map((item) => (
                        <motion.button
                            animate="animate"
                            className={cn(
                                "relative flex items-center rounded-none px-3 py-2",
                                "font-medium text-sm transition-colors duration-300",
                                selected === item.id
                                    ? "rounded-lg bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            custom={selected === item.id}
                            initial={false}
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            transition={transition as any}
                            variants={buttonVariants as any}
                        >
                            <item.icon
                                className={cn(selected === item.id && "text-primary-foreground")}
                                size={16}
                            />
                            <AnimatePresence initial={false}>
                                {selected === item.id && (
                                    <motion.span
                                        animate="animate"
                                        className="overflow-hidden"
                                        exit="exit"
                                        initial="initial"
                                        transition={transition as any}
                                        variants={spanVariants as any}
                                    >
                                        {item.title}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}

                    <motion.button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2",
                            "rounded-xl transition-all duration-200",
                            "hover:shadow-md active:border-primary/50",
                            isDark
                                ? [
                                    "bg-primary text-primary-foreground",
                                    "border-primary/30",
                                    "hover:bg-primary/90",
                                    "hover:border-primary/40",
                                ]
                                : [
                                    "bg-background text-muted-foreground",
                                    "border-border/30",
                                    "hover:bg-muted",
                                    "hover:text-foreground",
                                    "hover:border-border/40",
                                ]
                        )}
                        onClick={toggleTheme}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isDark ? (
                            <Moon className="h-3.5 w-3.5" />
                        ) : (
                            <Sun className="h-3.5 w-3.5" />
                        )}
                        <span className="font-medium text-sm">
                            {isDark ? "Dark" : "Light"}
                        </span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

export default Toolbar;
