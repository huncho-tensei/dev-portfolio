import { Block } from "@/components/Block";
import { site } from "@/content/site";
import { getHeadlines } from "@/lib/doomscroll";

export default async function Home() {
  const headlines = await getHeadlines();
  return (
    <main>
      <Block content={site} headlines={headlines} />
    </main>
  );
}
