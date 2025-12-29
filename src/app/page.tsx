import { fetchPortfolioData } from "@/lib/data";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const data = await fetchPortfolioData();

  return <HomeClient data={data} />;
}
