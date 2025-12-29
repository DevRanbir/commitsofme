"use server";

import { Item } from "@/components/Masonry";

export interface GitHubRepoData {
    title: string;
    description: string;
    image: string;
    year: string;
    repo: string;
}

const RAW_GITHUB_BASE = "https://raw.githubusercontent.com";

function getHeaders() {
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
}

// Helper to resolve relative URLs to absolute raw URLs
function resolveUrl(repo: string, branch: string, path: string): string {
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\.?\//, '');
    return `${RAW_GITHUB_BASE}/${repo}/${branch}/${cleanPath}`;
}

export async function fetchRepoData(repo: string): Promise<GitHubRepoData | null> {
    try {
        // 1. Fetch Repo Metadata to get default branch and description
        let defaultBranch = 'main';
        let metaDescription = '';

        try {
            const metaResponse = await fetch(`https://api.github.com/repos/${repo}`, {
                headers: getHeaders(),
                next: { revalidate: 3600 } // Reduce cache to 1 hour to see changes faster
            });
            if (metaResponse.ok) {
                const meta = await metaResponse.json();
                defaultBranch = meta.default_branch || 'main';
                metaDescription = meta.description || '';
            }
        } catch (e) {
            console.warn(`Failed to fetch metadata for ${repo}, defaulting to main branch.`);
        }

        // Fetch README (Raw content usually cached by CDN, but good to control)
        const response = await fetch(`${RAW_GITHUB_BASE}/${repo}/${defaultBranch}/README.md`, {
            next: { revalidate: 3600 } // Cache README for 1 hour
        });

        if (!response.ok) {
            console.error(`Failed to fetch README for ${repo} on branch ${defaultBranch}`);
            // If README fails but we have meta description, return partial data
            if (metaDescription) {
                return {
                    title: repo.split('/')[1],
                    description: metaDescription,
                    image: `https://opengraph.githubassets.com/1/${repo}`, // Fallback to social card
                    year: new Date().getFullYear().toString(),
                    repo
                };
            }
            return null;
        }
        const text = await response.text();

        // 2. Extract Image
        // Look for <img src="..."> in the banner section or generally first image
        let image = "";
        const imgMatch = text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i) || text.match(/!\[.*?\]\((.*?)\)/);
        if (imgMatch) {
            image = resolveUrl(repo, defaultBranch, imgMatch[1]);
        }

        // 3. Extract Title
        // Look for # 🚀 Title or just # Title
        let title = "";
        const titleMatch = text.match(/^#\s+(?:🚀\s+)?(.+)$/m);
        if (titleMatch) {
            title = titleMatch[1].trim();
        }

        // 4. Extract Description
        let description = "";

        // Priority 1: GitHub Description from Metadata (often cleaner)
        if (metaDescription) {
            description = metaDescription;
        }



        // Priority 2: "Description" or "About" Section from README
        // (Often more detailed than the tagline or meta description)
        if (!description) {
            // Regex matches ## 📖 Description or ## Description
            const descSection = text.match(/^##\s+(?:📖\s+)?(?:Description|About|Overview)(?:[^\n]*)?\n+([\s\S]*?)(?:\n##|$)/im);
            if (descSection) {
                // Get first non-empty paragraph
                const paragraphs = descSection[1].split(/\n\n+/);
                // Filter out empty lines, images, or html
                const firstPara = paragraphs.find(p => p.trim().length > 0 && !p.trim().startsWith('<') && !p.trim().startsWith('!'));
                if (firstPara) {
                    description = firstPara.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
                }
            }
        }

        // Priority 3: Blockquote > Tagline (Common in my READMEs)
        // If we still don't have a description, or if we want to check for the tagline under the title
        if (!description) {
            const taglineMatch = text.match(/^>\s+(.+)$/m);
            if (taglineMatch) {
                description = taglineMatch[1].trim();
            }
        }

        // Priority 4: First substantial paragraph
        if (!description) {
            // Find first paragraph that isn't a header (#), image (!), or html tag (<)
            const lines = text.split('\n');
            let potentialDesc = "";
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('![')) continue;
                if (trimmed.startsWith('<')) continue;
                if (trimmed.startsWith('```')) continue;
                // Found a candidate
                potentialDesc = trimmed;
                break;
            }
            if (potentialDesc) {
                // Clean up links logic simple
                description = potentialDesc.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            }
        }

        // 5. Extract Year/Date (Optional, can try to find 202X in text or default to current)
        let year = new Date().getFullYear().toString();
        const yearMatch = text.match(/\b202\d\b/);
        if (yearMatch) {
            year = yearMatch[0];
        }

        return {
            title: title || repo.split('/')[1],
            description,
            image,
            year,
            repo
        };

    } catch (error) {
        console.error(`Error fetching/parsing README for ${repo}:`, error);
        return null;
    }
}

export async function fetchUserRepos(username: string, limit: number = 10): Promise<string[]> {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&direction=desc&per_page=${limit}`, {
            headers: getHeaders(),
            next: { revalidate: 3600 } // Cache list for 1 hour
        });

        if (!response.ok) {
            // Check for rate limit
            const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
            console.error(`Failed to fetch repos for user ${username}. Rate limit remaining: ${rateLimitRemaining}`);
            return [];
        }
        const repos = await response.json();
        return repos.map((repo: any) => repo.full_name);
    } catch (error) {
        console.error(`Error fetching repos for ${username}:`, error);
        return [];
    }
}

// Optimized Server Action to fetch everything in one go
export async function getLatestProjects(username: string, limit: number = 10): Promise<Item[]> {
    const repoList = await fetchUserRepos(username, limit);
    if (repoList.length === 0) return [];

    const promises = repoList.map(repo => fetchRepoData(repo));
    const results = await Promise.all(promises);

    const fetchedItems: Item[] = [];
    results.forEach(data => {
        if (data && data.image) {
            // We can't use random on server component consistently for hydration match, 
            // but since this data is passed to client, random here fixes it for that render.
            // Ideally we'd use deterministic hash or client side calc, but this is fine for now.
            const height = Math.floor(Math.random() * (550 - 350 + 1) + 350);
            fetchedItems.push({
                id: data.repo,
                img: data.image,
                title: data.title,
                year: data.year,
                height: height,
                description: data.description // Pass description to item
            });
        }
    });

    return fetchedItems;
}
