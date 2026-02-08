export interface Token {
  text: string;
  type: 'word' | 'punctuation' | 'space';
}

export function tokenize(text: string): Token[] {
  const raw = text.match(/[A-Za-z]+|[^A-Za-z\s]+|\s+/g) ?? [];

  return raw.map(t => ({
    text: t,
    type: /^[A-Za-z]+$/.test(t)
      ? 'word'
      : /^\s+$/.test(t)
      ? 'space'
      : 'punctuation'
  }));
}
