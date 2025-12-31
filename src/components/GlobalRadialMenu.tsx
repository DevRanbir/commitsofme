"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RadialMenu, MenuItem } from "@/components/RadialMenu";
import {
    Home, Mail, Github, FolderOpen, User, X
} from "lucide-react";

export default function GlobalRadialMenu({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const radialMenuItems: MenuItem[] = [
        { id: 'close', label: 'Close', icon: X },
        { id: 'github', label: 'GitHub', icon: Github },
        { id: 'mail', label: 'Mail', icon: Mail },
        { id: 'home', label: 'Home', icon: Home },
        { id: 'projects', label: 'Projects', icon: FolderOpen },
        { id: 'about', label: 'About', icon: User },
        { id: 'socials', label: 'Socials', icon: User },
    ];

    const handleRadialSelect = (item: MenuItem) => {
        switch (item.id) {
            case 'github':
                // Default to generic since we are global context
                window.open('https://github.com/devRanbir', '_blank');
                break;
            case 'mail':
                // Default to generic since we are global context
                window.location.href = 'mailto:contact@example.com';
                break;
            case 'home':
                router.push('/');
                break;
            case 'projects':
                router.push('/projects');
                break;
            case 'about':
                router.push('/about');
                break;
            case 'close':
                // Menu closes automatically
                break;
            case 'socials':
                router.push('/socials');
                break;
        }
    };

    return (
        <RadialMenu menuItems={radialMenuItems} onSelect={handleRadialSelect}>
            {children}
        </RadialMenu>
    );
}
