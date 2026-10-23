export function countSyllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length > 2) w = w.replace(/(?<![aeiouy])(es|ed|e)$/, (m) => (m === "e" ? "" : m === "es" ? "s" : "d"));
  const groups = w.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 0);
}

export function fleschKincaidGrade(text: string): number | null {
  const words = text.match(/[A-Za-z']+/g) ?? [];
  if (words.length === 0) return null;
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59;
}
