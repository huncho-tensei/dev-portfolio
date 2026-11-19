import { Block } from "@/components/Block";
import { TextVersion } from "@/components/TextVersion";
import { site } from "@/content/site";
import { getHeadlines } from "@/lib/doomscroll";

export default async function Home() {
  const headlines = await getHeadlines();
  return (
    <main>
      <Block content={site} headlines={headlines} />
      <TextVersion content={site} headlines={headlines} />
      {/* Without JavaScript the scene never starts, so show the text version. */}
      <noscript>
        <style>{`#scroller{display:none}.text{position:static;width:auto;height:auto;clip-path:none;overflow:visible;white-space:normal}`}</style>
      </noscript>
    </main>
  );
}
