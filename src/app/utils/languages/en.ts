export function normalizeEnglish(word: string): string {
  // 复数 -> 单数
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y';      // studies -> study
  }

  if (word.endsWith('es') && word.length > 3) {
    return word.slice(0, -2);            // watches -> watch
  }

  if (word.endsWith('s') && word.length > 3) {
    return word.slice(0, -1);            // walks -> walk
  }

  // 过去式
  if (word.endsWith('ed') && word.length > 4) {
    return word.slice(0, -2);            // walked -> walk
  }

  // 进行时
  if (word.endsWith('ing') && word.length > 5) {
    return word.slice(0, -3);            // walking -> walk
  }

  return word;
}
