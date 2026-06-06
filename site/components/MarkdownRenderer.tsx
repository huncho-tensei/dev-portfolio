import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";

interface DirectiveNode {
  type: string;
  name?: string;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
  children?: DirectiveNode[];
}

/**
 * Turns markdown directives into gloss elements:
 *   :gloss[plain english]   ->  <span class="gloss-inline">   (inline)
 *   :::gloss ... :::         ->  <div class="gloss">           (between lines)
 * Both are hidden by default and shown when the Explain toggle is on.
 */
function remarkGloss() {
  return (tree: DirectiveNode) => {
    const walk = (node: DirectiveNode) => {
      if (
        (node.type === "textDirective" ||
          node.type === "leafDirective" ||
          node.type === "containerDirective") &&
        node.name === "gloss"
      ) {
        const inline = node.type === "textDirective";
        node.data = node.data ?? {};
        node.data.hName = inline ? "span" : "div";
        node.data.hProperties = { className: inline ? "gloss-inline" : "gloss" };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-hawi max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkDirective, remarkGloss]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
