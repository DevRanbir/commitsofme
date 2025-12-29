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

export const HelmetGallery = () => {
    const [items, setItems] = useState<Item[]>(defaultHelmetItems);

    useEffect(() => {
        async function loadRepos() {
            try {
                // Fetch projects largely cached on server
                const projects = await getLatestProjects("devRanbir", 6);
                if (projects.length > 0) {
                    setItems(projects);
                }
            } catch (error) {
                console.error("Failed to load GitHub projects:", error);
            }
        }

        loadRepos();
    }, []);

    return (
        <Masonry
            items={items}
            renderItem={(item) => (
                <HelmetCard
                    src={item.img}
                    title={item.title || ""}
                    year={item.year || ""}
                    description={item.description}
                    repoUrl={`https://github.com/${item.id}`} // item.id holds "username/repo"
                    demoUrl={item.url}
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
