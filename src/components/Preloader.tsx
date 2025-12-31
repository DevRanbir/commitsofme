"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Lottie from "lottie-react";
import { usePathname } from "next/navigation";

export default function Preloader() {
    const [loading, setLoading] = useState(true);
    const [animationData, setAnimationData] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Force scroll to top on refresh
        if (typeof window !== 'undefined') {
            window.history.scrollRestoration = 'manual';
            window.scrollTo(0, 0);
        }

        // Fetch the animation data from public folder
        fetch("/liquid%20loader%2001.json")
            .then((res) => res.json())
            .then((data) => setAnimationData(data))
            .catch((err) => console.error("Failed to load lottie animation:", err));

        // Initial load simulation
        const handleLoad = () => {
            // Initial load might need a slightly longer delay or just rely on the same logic
            setTimeout(() => setLoading(false), 2000);
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);
            return () => window.removeEventListener("load", handleLoad);
        }

        // Fallback
        const timeout = setTimeout(() => setLoading(false), 2500);
        return () => clearTimeout(timeout);
    }, []);

    // Trigger loader on route change
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
            window.scrollTo(0, 0); // Ensure scroll to top on nav
        }, 1500); // 1.5s transition for internal nav
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {animationData && (
                        <div className="w-64 h-64 md:w-96 md:h-96">
                            <Lottie animationData={animationData} loop={true} />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
