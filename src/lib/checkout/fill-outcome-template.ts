/** Replace `{{key}}` placeholders (whitespace allowed inside braces). */
export function fillOutcomeTemplate(template: string, refs: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => refs[key] ?? "");
}
