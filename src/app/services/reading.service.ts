import { Injectable, signal, computed } from '@angular/core';
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

  /** 所有 reading（已是 signal，保留） */
  readonly readingsSignal = signal<ReadingItem[]>([]);

  /**
   * ⚠️ 关键改动：
   * vocabTables 也变成 signal
   * key = readingId
   */
  readonly vocabTablesSignal =
    signal<Record<string, VocabularyTable>>({});

  /** 临时词条表 signal，不存 localStorage */
  readonly previewWordTablesSignal = signal<Record<string, WordEntry[]>>({});


  constructor() {
    this.loadFromStorage();
  }

  // ---------- Reading ----------

  allReadings = computed(() => this.readingsSignal());

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

  deleteReading(readingId: string) {
    this.readingsSignal.update(list =>
      list.filter(r => r.id !== readingId)
    );

    this.vocabTablesSignal.update(tables => {
      const copy = { ...tables };
      delete copy[readingId];
      return copy;
    });

    this.saveToStorage();
  }

  // ---------- Vocabulary Table ----------

  /** 所有词表（数组形式，供 Sidebar / VocabularyPage 使用） */
  readonly allVocabTablesSignal = computed(() =>
    Object.values(this.vocabTablesSignal())
  );

  /** 根据 readingId 取单个词表（Details 用） */
  vocabTableByReadingId(readingId: string) {
    return computed(() =>
      this.vocabTablesSignal()[readingId]
    );
  }

  addVocabTable(readingId: string, name: string) {
    const table: VocabularyTable = {
      id: crypto.randomUUID(),
      readingId,
      name,
      entries: []
    };

    this.vocabTablesSignal.update(tables => ({
      ...tables,
      [readingId]: table
    }));

    this.saveToStorage();
  }

  replaceWordTable(readingId: string, entries: WordEntry[]) {
    this.vocabTablesSignal.update(tables => {
      const table = tables[readingId];
      if (!table) return tables;

      return {
        ...tables,
        [readingId]: { ...table, entries }
      };
    });

    this.saveToStorage();
  }

  deleteVocabTable(readingId: string) {
    this.vocabTablesSignal.update(tables => {
      const copy = { ...tables };
      delete copy[readingId];
      return copy;
    });

    this.saveToStorage();
  }

  // ---------- Word ----------

  addWord(readingId: string, original:string, normalized: string, sentence?: string) {
  const now = Date.now();

  this.vocabTablesSignal.update(tables => {
    const table = tables[readingId];
    if (!table) return tables;

    const exists = table.entries.some(e => e.normalized === normalized);

    // ✅ 生成全新 entries 数组
    const newEntries = exists
      ? table.entries.map(e =>
          e.normalized === normalized
            ? {
                ...e,                     // 新对象
                count: e.count + 1,        // 新值
                lastSeenAt: now
              }
            : e
        )
      : [
          ...table.entries,
          {
            original,
            normalized,
            count: 1,
            firstAddedAt: now,
            lastSeenAt: now,
            sentence,
            isSaved: true,
          }
        ];

    return {
      ...tables,
      [readingId]: {
        ...table,
        entries: newEntries   // 新数组引用
      }
    };
  });

  this.saveToStorage();
}


addPreviewWord(readingId: string, original:string, normalized: string, sentence?: string) {
  const now = Date.now();

  this.previewWordTablesSignal.update(tables => {
    const current = tables[readingId] ?? [];

    const exists = current.some(e => e.normalized === normalized);

    const newEntries = exists
      ? current.map(e =>
          e.normalized === normalized
            ? { ...e, lastSeenAt: now }
            : e
        )
      : [
          ...current,
          {
            original,
            normalized,
            count: 0,
            firstAddedAt: now,
            lastSeenAt: now,
            sentence,
            isSaved: false,
          }
        ];

    return {
      ...tables,
      [readingId]: newEntries
    };
  });
}



  deleteWord(readingId: string, word: string) {
    this.vocabTablesSignal.update(tables => {
      const table = tables[readingId];
      if (!table) return tables;

      return {
        ...tables,
        [readingId]: {
          ...table,
          entries: table.entries.filter(e => e.normalized !== word)
        }
      };
    });

    this.saveToStorage();
  }

  // ---------- persistence ----------

  private loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed: PersistedState = JSON.parse(raw);

    this.readingsSignal.set(parsed.readings || []);
    this.vocabTablesSignal.set(parsed.vocabTables || {});
  }

  private saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        readings: this.readingsSignal(),
        vocabTables: this.vocabTablesSignal()
      })
    );
  }
}
