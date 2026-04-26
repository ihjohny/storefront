import type { SerializedEditorState } from "lexical";

/** True when value is Payload / Lexical editor JSON (`root.type === "root"`). */
export function isLexicalSerializedState(
  value: unknown,
): value is SerializedEditorState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const root = (value as { root?: { type?: string } }).root;
  return typeof root === "object" && root != null && root.type === "root";
}
