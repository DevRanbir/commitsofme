import Papa from 'papaparse';

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoVzcA6yC85NKNN-PxOpF6Trwd1sh7MaQaajB0joCO2bHTLkWzZF9EcjOFmgwqUMYxaeLhJSOHgBw8/pub?gid=36034017&single=true&output=csv';

export type PortfolioData = {
    section: string;
    title: string;
    description: string;
    link?: string;
    type?: string;
    image?: string;
};

export async function fetchPortfolioData(): Promise<PortfolioData[]> {
    try {
        const response = await fetch(SHEET_URL, { next: { revalidate: 60 } }); // Revalidate every 60s
        const text = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                complete: (results) => {
                    const data = results.data as any[];
                    // Clean/Map keys if necessary (CSV headers: Section,Title,Description,Link,Type,Image)
                    const mappedData = data.map(item => {
                        let imageUrl = item.Image;

                        // Transform Google Drive links to direct image links
                        if (imageUrl && imageUrl.includes('drive.google.com') && imageUrl.includes('/view')) {
                            const idMatch = imageUrl.match(/\/d\/(.*?)\//);
                            if (idMatch && idMatch[1]) {
                                imageUrl = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
                            }
                        }
                        // Clean up trailing punctuation if present
                        if (imageUrl) imageUrl = imageUrl.replace(/[,;]$/, '').trim();

                        return {
                            section: item.Section,
                            title: item.Title,
                            description: item.Description,
                            link: item.Link,
                            type: item.Type,
                            image: imageUrl
                        };
                    }).filter(item => item.section && item.title); // Filter empty rows

                    resolve(mappedData);
                },
                error: (error: any) => reject(error),
            });
        });
    } catch (error) {
        console.error("Error fetching sheet data:", error);
        return [];
    }
}
