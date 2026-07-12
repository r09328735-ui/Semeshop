import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "a",
      "blockquote",
      "code",
      "pre",
      "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt"],
  });
}
