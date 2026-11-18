import { Block } from "@/components/Block";
import { site } from "@/content/site";

export default function Home() {
  return (
    <main>
      <Block content={site} headlines={[]} />
    </main>
  );
}
