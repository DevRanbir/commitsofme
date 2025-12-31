"use client";

import Masonry, { Item } from "@/components/Masonry";
import { HelmetCard } from "@/components/HelmetCard";
import { getLatestProjects } from "@/lib/github";
import { useEffect, useState } from "react";

const defaultHelmetItems: Item[] = [
    {
        id: "1",
        img: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=1000&auto=format&fit=crop", // Abstract 1
        title: "Project Loading...",
        year: "...",
        height: 480,
    },
    {
        id: "2",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", // Abstract 2
        title: "Project Loading...",
        year: "...",
        height: 400,
    },
];

import { ProjectItem } from '../actions/github'; // Assuming I can export this or redefine

interface HelmetGalleryProps {
    projects?: any[]; // avoiding strict type import for now to prevent circular deps if action is server
}

export const HelmetGallery = ({ projects }: HelmetGalleryProps) => {
    const [items, setItems] = useState<Item[]>(defaultHelmetItems);

    useEffect(() => {
        if (projects && projects.length > 0) {
            // Map external projects to Masonry Item format
            const mappedItems: Item[] = projects.map((p, i) => ({
                id: String(i),
                img: p.image,
                title: p.title,
                year: '2025', // Default or extract from data if available
                height: i % 2 === 0 ? 480 : 400, // Staggered heights
                description: p.description,
                url: p.link, // Store repo link in url
                demoUrl: p.demo_link // Store demo link
            }));
            setItems(mappedItems);
        } else {
            // Fallback to internal fetch if no projects provided
            async function loadRepos() {
                try {
                    const fetchedProjects = await getLatestProjects("devRanbir", 6);
                    if (fetchedProjects.length > 0) {
                        setItems(fetchedProjects);
                    }
                } catch (error) {
                    console.error("Failed to load GitHub projects:", error);
                }
            }
            loadRepos();
        }
    }, [projects]);

    return (
        <Masonry
            items={items}
            renderItem={(item) => (
                <HelmetCard
                    src={item.img}
                    title={item.title || ""}
                    year={item.year || ""}
                    description={item.description}
                    repoUrl={item.url} // Use the actual mapped URL (GitHub link)
                    demoUrl={item.demoUrl} // Use the actual demo URL
                />
            )}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={1}
            blurToFocus={true}
            colorShiftOnHover={false}
            columns={2}
        />
    )
}
