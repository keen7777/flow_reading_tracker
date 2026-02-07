import { Injectable, signal } from '@angular/core';
import { ReadingItem } from '../models/reading-item';
import { VocabularyTable } from '../models/vocabulary-table';
import { WordEntry } from '../models/word-entry';

const STORAGE_KEY = 'flow-reading-state';

interface PersistedState {
  readings: ReadingItem[];
  vocabTables: Record<string, VocabularyTable>;
}


@Injectable({ providedIn: 'root' })
export class ReadingService {
  private readingsSignal = signal<ReadingItem[]>([]);
  private vocabTables: Record<string, VocabularyTable> = {};

  constructor() {
    this.loadFromStorage();
  }

  // ---------- Reading ----------

  getAllReadings(): ReadingItem[] {
    return this.readingsSignal();
  }

  getReadingById(id: string): ReadingItem | undefined {
    return this.readingsSignal().find(r => r.id === id);
  }

  addNewReading(item: { title: string; content?: string }): ReadingItem {
    const reading: ReadingItem = {
      id: crypto.randomUUID(),
      title: item.title,
      content: item.content
    };

    this.readingsSignal.update(list => [...list, reading]);
    this.addVocabTable(reading.id, `Word Table - ${reading.title}`);
    this.saveToStorage();
    return reading;
  }

  /** 删除文章：必须同时删除对应词表 */
  deleteReading(readingId: string) {
    this.readingsSignal.update(list =>
      list.filter(r => r.id !== readingId)
    );
    delete this.vocabTables[readingId];
    this.saveToStorage();
  }

  // ---------- Vocabulary Table ----------

  /** 所有词表（用于 Vocabulary List 页面） */
  getAllVocabTables(): VocabularyTable[] {
    return Object.values(this.vocabTables);
  }

  getVocabByReadingId(readingId: string): VocabularyTable | undefined {
    return this.vocabTables[readingId];
  }

  addVocabTable(readingId: string, name: string): VocabularyTable {
    const table: VocabularyTable = {
      id: crypto.randomUUID(),
      readingId,
      name,
      entries: []
    };
    this.vocabTables[readingId] = table;
    this.saveToStorage();
    return table;
  }

  /** 整体替换词表（导入 JSON 等） */
  replaceWordTable(readingId: string, entries: WordEntry[]) {
    const table = this.vocabTables[readingId];
    if (!table) return;

    table.entries = entries;
    this.saveToStorage();
  }

  /** 只删除词表本身，不影响 reading */
  deleteVocabTable(readingId: string) {
    delete this.vocabTables[readingId];
    this.saveToStorage();
  }

  // ---------- Word ----------

  addWord(readingId: string, word: string, sentence?: string) {
    let table = this.vocabTables[readingId];
    if (!table) {
      table = this.addVocabTable(readingId, `Word Table`);
    }

    const now = Date.now();
    const existing = table.entries.find(e => e.word === word);
    if (existing) {
      existing.count++;
      existing.lastSeenAt = now;
    } else {
      table.entries.push({
        word,
        count: 1,
        firstAddedAt: now,
        lastSeenAt: now,
        sentence
      });
    }
    this.saveToStorage();
  }

  deleteWord(readingId: string, word: string) {
    const table = this.vocabTables[readingId];
    if (!table) return;

    table.entries = table.entries.filter(e => e.word !== word);
    this.saveToStorage();
  }

  // ---------- persistence ----------

  private loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    this.readingsSignal.set(parsed.readings || []);
    this.vocabTables = parsed.vocabTables || {};
  }

  private saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        readings: this.readingsSignal(),
        vocabTables: this.vocabTables
      })
    );
  }
}

