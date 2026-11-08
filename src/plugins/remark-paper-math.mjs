import katex from "katex";
import { visit } from "unist-util-visit";

// Raw HTML paragraphs/tables bypass remark-math. Keep their TeX editable
// while rendering explicitly marked formula spans at build time.
export default function remarkPaperMath() {
  return (tree, file) => {
    visit(tree, "html", (node) => {
      node.value = node.value.replace(
        /<span class="paper-math(-display)?">([^<]*)<\/span>/g,
        (_, display, source) => {
          const tex = source.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
          try {
            return `<span class="doduo-math${display || ""}">${katex.renderToString(tex, {
              displayMode: Boolean(display),
              throwOnError: true,
              trust: false,
              strict: "error",
            })}</span>`;
          } catch (error) {
            file.fail(`Invalid paper formula: ${error.message}`, node);
          }
        },
      );
    });
  };
}
