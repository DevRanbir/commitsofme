'use server';

export interface ProjectItem {
    image: string;
    link: string;
    title: string;
    description: string;
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
            repos.map(async (repo: any) => {
                // Try getting social preview (OG image) first as it's cleaner, then README
                // Actually, GitHub doesn't expose OG image in API easily without scraping.
                // Let's try raw README content to find an image.

                let imageUrl = 'https://picsum.photos/600/600?grayscale'; // Fallback

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

                    if (readmeRes.ok) {
                        const readmeText = await readmeRes.text();

                        // Find all image matches
                        // Match ![alt](url)
                        const mdImageRegex = /!\[.*?\]\((.*?)\)/g;
                        // Match <img ... src="url" ...> handling newlines and other attributes
                        const htmlImageRegex = /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi;

                        const candidates: string[] = [];

                        let match;
                        while ((match = mdImageRegex.exec(readmeText)) !== null) {
                            if (match[1]) candidates.push(match[1]);
                        }
                        while ((match = htmlImageRegex.exec(readmeText)) !== null) {
                            // match[2] corresponds to the 2nd capture group which is the URL
                            if (match[2]) candidates.push(match[2]);
                        }

                        // Filter out likely badges and find the first "real" image
                        const validImage = candidates.find(url => {
                            const lower = url.toLowerCase();
                            const isBadge = lower.includes('shields.io') ||
                                lower.includes('travis-ci') ||
                                lower.includes('badge') ||
                                lower.includes('github.com/workflows');
                            return !isBadge;
                        });

                        if (validImage) {
                            imageUrl = validImage;

                            // Handle relative paths
                            if (!imageUrl.startsWith('http')) {
                                // Remove leading ./ or /
                                const cleanPath = imageUrl.replace(/^(\.?\/)+/, '');
                                imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${cleanPath}`;
                            }

                            // Fix for CORS issues with GitHub images (both user-attachments and raw content)
                            // We proxy ALL images found in READMEs to ensure valid CORS headers for the canvas
                            if (imageUrl) {
                                // We need to encode it properly
                                imageUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error fetching readme for ${repo.name}`, e);
                }

                return {
                    image: imageUrl, // Will be the proxied URL or the default fallback
                    link: repo.html_url,
                    title: repo.name,
                    description: repo.description || 'No description provided.',
                    demo_link: repo.homepage,
                };
            })
        );

        return projects;
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
