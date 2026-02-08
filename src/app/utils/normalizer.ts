import { normalizeEnglish } from './languages/en';

export type LanguageCode = 'en'; // 以后加 'de' | 'fr' ...

/** 字符级清洗：去标点、统一大小写 */
export function cleanRawWord(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^[^a-z]+|[^a-z]+$/g, '');
}

/** 语言相关的词形规范化入口 */
export function normalizeWord(
  raw: string,
  lang: LanguageCode = 'en'
): string {
  const cleaned = cleanRawWord(raw);
  if (!cleaned) return '';

  switch (lang) {
    case 'en':
      return normalizeEnglish(cleaned);
    default:
      return cleaned;
  }
}
