'use server';

export interface ProjectItem {
    image: string;
    link: string;
    title: string;
    description: string;
    demo_link?: string | null;
}

function isLikelyBadgeOrPlaceholder(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('shields.io') ||
        lower.includes('travis-ci') ||
        lower.includes('github.com/workflows') ||
        lower.includes('badge') ||
        lower.includes('placeholder-image');
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

export async function getGithubProjects(): Promise<ProjectItem[]> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.warn('No GITHUB_TOKEN found');
        return [];
    }

    try {
        // 1. Get User Data (to find username)
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Portfolio-App',
            },
            next: { revalidate: 3600 }
        });

        if (!userRes.ok) throw new Error('Failed to fetch user');
        const user = await userRes.json();
        const username = user.login;

        // 2. Get Repos (sorted by updated)
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Portfolio-App',
            },
            next: { revalidate: 3600 }
        });

        if (!reposRes.ok) throw new Error('Failed to fetch repos');
        const repos = await reposRes.json();

        // 3. For each repo, try to get an image
        const projects = await Promise.all(
            repos.map(async (repo: any): Promise<ProjectItem | null> => {
                // Try getting social preview (OG image) first as it's cleaner, then README
                // Actually, GitHub doesn't expose OG image in API easily without scraping.
                // Let's try raw README content to find an image.

                let imageUrl: string | null = null;

                try {
                    // Try fetch README
                    // GET /repos/{owner}/{repo}/readme
                    const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'User-Agent': 'Portfolio-App',
                            'Accept': 'application/vnd.github.raw'
                        },
                        next: { revalidate: 3600 }
                    });

                    if (!readmeRes.ok) {
                        return null;
                    }

                    const readmeText = await readmeRes.text();

                    // Find all image matches
                    // Match ![alt](url)
                    const mdImageRegex = /!\[.*?\]\((.*?)\)/g;
                    // Match <img ... src="url" ...> handling newlines and other attributes
                    const htmlImageRegex = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi;

                    const candidates: string[] = [];

                    let match;
                    while ((match = mdImageRegex.exec(readmeText)) !== null) {
                        if (match[1]) candidates.push(match[1].trim());
                    }
                    while ((match = htmlImageRegex.exec(readmeText)) !== null) {
                        if (match[2]) candidates.push(match[2].trim());
                    }

                    for (const candidate of candidates) {
                        if (!candidate || isLikelyBadgeOrPlaceholder(candidate)) {
                            continue;
                        }

                        let resolvedUrl = candidate;

                        if (resolvedUrl.startsWith('//')) {
                            resolvedUrl = `https:${resolvedUrl}`;
                        } else if (!resolvedUrl.startsWith('http')) {
                            const cleanPath = resolvedUrl.replace(/^(\.?\/)+/, '');
                            resolvedUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${cleanPath}`;
                        }

                        const isImage = await isValidRemoteImage(resolvedUrl);
                        if (!isImage) {
                            continue;
                        }

                        imageUrl = `/api/proxy-image?url=${encodeURIComponent(resolvedUrl)}`;
                        break;
                    }
                } catch (e) {
                    console.error(`Error fetching readme for ${repo.name}`, e);
                    return null;
                }

                if (!imageUrl) {
                    return null;
                }

                return {
                    image: imageUrl,
                    link: repo.html_url,
                    title: repo.name,
                    description: repo.description || 'No description provided.',
                    demo_link: repo.homepage,
                };
            })
        );

        return projects.filter((project): project is ProjectItem => project !== null);
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return [];
    }
}

export interface GithubProfile {
    login: string;
    email: string | null;
    blog: string | null; // Website
    social_accounts: Array<{
        provider: string;
        url: string;
        icon?: any; // To be mapped on client
    }>;
}

export async function getGithubProfile(): Promise<GithubProfile | null> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return null;

    try {
        // 1. Get User Data
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Portfolio-App',
            },
            next: { revalidate: 3600 }
        });

        if (!userRes.ok) return null;
        const user = await userRes.json();

        // 2. Get Social Accounts
        const socialsRes = await fetch(`https://api.github.com/users/${user.login}/social_accounts`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Portfolio-App',
            },
            next: { revalidate: 3600 }
        });

        let socialAccounts = [];
        if (socialsRes.ok) {
            socialAccounts = await socialsRes.json();
        }

        return {
            login: user.login,
            email: user.email, // This is often null for public profile unless 'user:email' scope is used and logic handles it. 
            // Often public email is in 'email' field if set publicly.
            blog: user.blog,
            social_accounts: socialAccounts
        };

    } catch (e) {
        console.error("Error fetching github profile", e);
        return null;
    }
}
