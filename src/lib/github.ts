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

function isLikelyBadgeOrPlaceholder(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('shields.io') ||
        lower.includes('travis-ci') ||
        lower.includes('github.com/workflows') ||
        lower.includes('badge') ||
        lower.includes('placeholder-image');
}

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
    if (path.startsWith('//')) return `https:${path}`;
    const cleanPath = path.replace(/^\.?\//, '');
    return `${RAW_GITHUB_BASE}/${repo}/${branch}/${cleanPath}`;
}

async function isValidRemoteImage(url: string): Promise<boolean> {
    const headers = {
        'User-Agent': 'Portfolio-App'
    };

    try {
        const headResponse = await fetch(url, {
            method: 'HEAD',
            headers,
            next: { revalidate: 3600 }
        });

        if (headResponse.ok) {
            const contentType = headResponse.headers.get('Content-Type')?.toLowerCase() ?? '';
            return contentType.startsWith('image/');
        }

        if (headResponse.status !== 403 && headResponse.status !== 405) {
            return false;
        }
    } catch {
        // Fall back to GET when HEAD is blocked by remote host.
    }

    try {
        const getResponse = await fetch(url, {
            method: 'GET',
            headers,
            next: { revalidate: 3600 }
        });

        if (!getResponse.ok) {
            return false;
        }

        const contentType = getResponse.headers.get('Content-Type')?.toLowerCase() ?? '';
        return contentType.startsWith('image/');
    } catch {
        return false;
    }
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
            return null;
        }
        const text = await response.text();

        // 2. Extract Image
        // Look for <img src="..."> in the banner section or generally first image
        let image = "";
        const mdImageRegex = /!\[.*?\]\((.*?)\)/g;
        const htmlImageRegex = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi;
        const candidates: string[] = [];

        let match;
        while ((match = mdImageRegex.exec(text)) !== null) {
            if (match[1]) candidates.push(match[1].trim());
        }
        while ((match = htmlImageRegex.exec(text)) !== null) {
            if (match[2]) candidates.push(match[2].trim());
        }

        for (const candidate of candidates) {
            if (!candidate || isLikelyBadgeOrPlaceholder(candidate)) {
                continue;
            }

            const resolved = resolveUrl(repo, defaultBranch, candidate);
            if (await isValidRemoteImage(resolved)) {
                image = resolved;
                break;
            }
        }

        if (!image) {
            return null;
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
