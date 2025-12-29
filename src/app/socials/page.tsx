import { fetchPortfolioData } from "@/lib/data";
import SocialsClient from "@/components/SocialsClient";

export default async function Socials() {
    const data = await fetchPortfolioData();

    return <SocialsClient data={data} />;
}
