const programTitleSmallWords = new Set(["a", "an", "and", "for", "in", "of", "the", "to"]);

export function formatProgramTitle(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      if (!word || /^[A-Z0-9]{2,}$/.test(word)) return word;
      const match = word.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
      if (!match) return word;
      const [, prefix, core, suffix] = match;
      const lower = core.toLowerCase();
      if (index > 0 && programTitleSmallWords.has(lower)) {
        return `${prefix}${lower}${suffix}`;
      }
      return `${prefix}${lower.charAt(0).toUpperCase()}${lower.slice(1)}${suffix}`;
    })
    .join(" ");
}
