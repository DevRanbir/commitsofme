import { fetchPortfolioData } from "@/lib/data";
import { getGithubProfile } from "@/actions/github";
import SocialsClient from "@/components/SocialsClient";

export default async function Socials() {
    const data = await fetchPortfolioData();
    const githubProfile = await getGithubProfile();

    return <SocialsClient data={data} githubProfile={githubProfile} />;
}
