import { WordEntry } from './word-entry';

export interface VocabularyTable {
  id: string;
  readingId: string;
  name: string;
  entries: WordEntry[];
}
