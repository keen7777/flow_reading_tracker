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
  /** 所有文章列表，使用 signal 实现自动更新 */
  private readingsSignal = signal<ReadingItem[]>([]);

  /** 所有词表，用 readingId 快速索引 */
  private vocabTables: Record<string, VocabularyTable> = {};

  constructor() {
    this.loadFromStorage();
  }

  // ----------------- Reading List -----------------

  /** 根据 ID 获取文章 */
  getReadingById(id: string): ReadingItem | undefined {
    return this.readingsSignal().find(r => r.id === id);
  }

  /** 获取全部文章 */
  getAllReadings(): ReadingItem[] {
    return this.readingsSignal();
  }

  /** 添加新文章（本地上传） */
  addNewReading(item: { title: string, content?: string }): ReadingItem {
    const newReading: ReadingItem = { id: crypto.randomUUID(), ...item };
    this.readingsSignal.update(list => [...list, newReading]);
    this.addVocabTable(newReading.id, `word table-${item.title}`);
    this.saveToStorage();
    return newReading;
  }


  /** 更新文章内容（如用户上传本地 txt 文件后） */
  updateReadingContent(id: string, content: string) {
    this.readingsSignal.update(list =>
      list.map(r => r.id === id ? { ...r, content } : r)
    );
    this.saveToStorage(); // ⭐
  }

  // ----------------- Vocabulary Tables -----------------
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
    this.saveToStorage();
  }

  deleteWord(readingId: string, word: string) {
    const table = this.getVocabByReadingId(readingId);
    if (!table) return;
    table.entries = table.entries.filter(e => e.word !== word);
    this.saveToStorage();
  }

  //----------------load and save from localstorage:
  private loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed: PersistedState = JSON.parse(raw);
      this.readingsSignal.set(parsed.readings || []);
      this.vocabTables = parsed.vocabTables || {};
    } catch (e) {
      console.error('Failed to parse storage', e);
    }
  }

  private saveToStorage() {
    const state: PersistedState = {
      readings: this.readingsSignal(),
      vocabTables: this.vocabTables
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

}
