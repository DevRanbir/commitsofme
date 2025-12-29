import { fetchPortfolioData } from "@/lib/data";
import AboutClient from "@/components/AboutClient";

export default async function About() {
    const data = await fetchPortfolioData();

    return <AboutClient data={data} />;
}
