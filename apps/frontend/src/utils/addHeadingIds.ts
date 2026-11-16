export type THeading = { id: string; text: string; level: "h2" | "h3" };

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  nbsp: " ",
};

const toText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e: string) => ENTITIES[e])
    .trim();

// Gives every <h2>/<h3> in the article HTML an id (keeping an existing one) and
// returns the matching table-of-contents entries. Runs on the server, on HTML
// the backend has already sanitized; the ids it adds contain only letters,
// combining marks (Bangla vowel signs), digits and "-", so they are
// attribute-safe.
// shortcut: regex, assumes headings are not nested inside each other; switch
// to an HTML parser if the editor ever emits that.
export const addHeadingIds = (html: string) => {
  const headings: THeading[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string = "", inner: string) => {
      const text = toText(inner);
      if (!text) return match;

      const existing = attrs.match(/\sid\s*=\s*["']([^"']+)["']/i)?.[1];
      const base =
        existing ||
        text
          .toLowerCase()
          .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
          .replace(/^-+|-+$/g, "") ||
        "section";
      let id = base;
      for (let n = 2; !existing && used.has(id); n++) id = `${base}-${n}`;
      used.add(id);

      headings.push({ id, text, level: tag.toLowerCase() as THeading["level"] });
      return existing ? match : `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
    },
  );

  return { html: out, headings };
};
