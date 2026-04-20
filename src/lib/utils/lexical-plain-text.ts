/**
 * Best-effort plain text from Payload Lexical richText JSON (or legacy string).
 */
export function lexicalToPlainText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t.length ? t : null;
  }
  if (typeof value !== "object") return null;

  const extract = (node: unknown): string => {
    if (node == null) return "";
    if (typeof node === "string") return node;
    if (typeof node !== "object") return "";
    const o = node as Record<string, unknown>;
    if (typeof o.text === "string" && o.type === "text") return o.text;
    if (Array.isArray(o.children)) {
      return o.children.map(extract).join("");
    }
    return "";
  };

  const root = (value as Record<string, unknown>).root;
  const text = extract(root ?? value).replace(/\s+/g, " ").trim();
  return text.length ? text : null;
}
