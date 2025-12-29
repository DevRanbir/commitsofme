"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Lottie from "lottie-react";

export default function Preloader() {
    const [loading, setLoading] = useState(true);
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        // Fetch the animation data from public folder
        fetch("/liquid%20loader%2001.json")
            .then((res) => res.json())
            .then((data) => setAnimationData(data))
            .catch((err) => console.error("Failed to load lottie animation:", err));

        // Simulate loading time or wait for window load
        const handleLoad = () => {
            setTimeout(() => setLoading(false), 2000); // Min 2s load time for effect
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);
            return () => window.removeEventListener("load", handleLoad);
        }

        // Fallback in case load event already fired or takes too long
        const timeout = setTimeout(() => setLoading(false), 2500);
        return () => clearTimeout(timeout);

    }, []);

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
