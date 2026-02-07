import { Injectable } from '@angular/core';
import { ReadingItem } from '../models/reading-item';
import { VocabularyTable } from '../models/vocabulary-table';
import { WordEntry } from '../models/word-entry';

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private readings: ReadingItem[] = [];
  private vocabTables: VocabularyTable[] = [];

  // ----------------- Reading List -----------------
  getReadings() {
    return this.readings;
  }

  getReadingById(id: string) {
    return this.readings.find(r => r.id === id);
  }

  addReading(title: string, assetPath: string): ReadingItem {
    const newReading: ReadingItem = {
      id: crypto.randomUUID(),
      title,
      assetPath
    };
    this.readings.push(newReading);
    return newReading;
  }

  // ----------------- Vocabulary Tables -----------------
  getVocabByReadingId(readingId: string): VocabularyTable | undefined {
    return this.vocabTables.find(v => v.readingId === readingId);
  }

  addVocabTable(readingId: string, name: string): VocabularyTable {
    const table: VocabularyTable = {
      id: crypto.randomUUID(),
      readingId,
      name,
      entries: []
    };
    this.vocabTables.push(table);
    return table;
  }

  // ----------------- WordEntry 操作 -----------------
  addWord(readingId: string, word: string, sentence?: string) {
    let table = this.getVocabByReadingId(readingId);
    if (!table) {
      table = this.addVocabTable(readingId, `词表-${readingId}`);
    }

    const now = Date.now();
    const existing = table.entries.find(e => e.word.toLowerCase() === word.toLowerCase());
    if (existing) {
      existing.count++;
      existing.lastSeenAt = now;
    } else {
      table.entries.push({ word, count: 1, firstAddedAt: now, lastSeenAt: now, sentence });
    }
  }

  deleteWord(readingId: string, word: string) {
    const table = this.getVocabByReadingId(readingId);
    if (!table) return;
    table.entries = table.entries.filter(e => e.word !== word);
  }
}
