import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WordEntry } from '../../models/word-entry';
import { ReadingService } from '../../services/reading.service';
import { VocabularyTableComponent } from '../../components/vocabulary-table/vocabulary-table.component';
import { TextDisplayComponent } from './text-display.component/text-display.component';
import { ToggleSwitchComponent } from '../../components/toggle-switch.component/toggle-switch.component';
import { cleanRawWord, normalizeWord } from '../../language/normalizer';


@Component({
  selector: 'app-reading-page',
  standalone: true,
  imports: [
    CommonModule,
    VocabularyTableComponent,
    TextDisplayComponent,
    ToggleSwitchComponent
  ],
  templateUrl: './reading-page.component.html',
  styleUrls: ['./reading-page.component.scss'],
})
export class ReadingPageComponent {

  /** ------------------- UI Signals ------------------- */
  highlightModeDiscreteSignal = signal(false);
  fullTextSignal = signal<string[][]>([]);
  currentPageSignal = signal(1);
  wordTableSignal = signal<WordEntry[]>([]);
  readingTitle = signal('');

  /** 当前 reading ID（非 signal，仅作为 key） */
  currentReadingId: string | null = null;

  WORDS_PER_PAGE = 200;

  constructor(
    private route: ActivatedRoute,
    private readingService: ReadingService
  ) { }

  /** ------------------- 初始化 ------------------- */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.currentReadingId = id;

    /* ✅ 从 readingsSignal 中读取文章 */
    const reading = this.readingService
      .readingsSignal()
      .find(r => r.id === id);

    if (!reading) return;

    this.readingTitle.set(reading.title);

    if (reading.content) {
      this.loadText(reading.content);
    }

    /* ✅ 从 vocabTablesSignal 中读取词表 */
    const table = this.readingService.vocabTablesSignal()[id];
    this.wordTableSignal.set(table ? [...table.entries] : []);
  }

  /** ------------------- 文本分页 ------------------- */
  loadText(text: string) {
    if (!this.currentReadingId) return;

    /* ✅ 正确更新 reading content（触发 signal） */
    this.readingService.readingsSignal.update(list =>
      list.map(r =>
        r.id === this.currentReadingId
          ? { ...r, content: text }
          : r
      )
    );

    /* 以下逻辑保持你原来的分页实现 */
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const pages: string[][] = [];
    let currentPage: string[] = [];
    let wordCount = 0;

    for (const para of paragraphs) {
      const count = para.split(/\s+/).length;
      if (wordCount + count > this.WORDS_PER_PAGE && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        wordCount = 0;
      }
      currentPage.push(para);
      wordCount += count;
    }

    if (currentPage.length > 0) pages.push(currentPage);

    this.fullTextSignal.set(pages);
    this.currentPageSignal.set(1);
  }

  /** ------------------- 分页 ------------------- */
  get totalPages() {
    return this.fullTextSignal().length;
  }

  get currentPageParagraphs(): string[] {
    return this.fullTextSignal()[this.currentPageSignal() - 1] || [];
  }

  prevPage() {
    if (this.currentPageSignal() > 1) {
      this.currentPageSignal.update(v => v - 1);
    }
  }

  nextPage() {
    if (this.currentPageSignal() < this.totalPages) {
      this.currentPageSignal.update(v => v + 1);
    }
  }

  /** ------------------- 单词操作 ------------------- */
  handleWordSelected(event: { word: string; sentence: string }) {
    if (!this.currentReadingId) return;

    const normalized = normalizeWord(event.word, 'en');
    if (!normalized) return;

    this.readingService.addWord(
      this.currentReadingId,
      normalized,
      event.sentence
    );

    /* ✅ 每次都从 service 同步最新 entries */
    const table =
      this.readingService.vocabTablesSignal()[this.currentReadingId];

    this.wordTableSignal.set(table ? [...table.entries] : []);
  }

  deleteWord(entry: WordEntry) {
    if (!this.currentReadingId) return;

    this.readingService.deleteWord(
      this.currentReadingId,
      entry.word
    );

    const table =
      this.readingService.vocabTablesSignal()[this.currentReadingId];

    this.wordTableSignal.set(table ? [...table.entries] : []);
  }

  /** ------------------- 本地文件上传 ------------------- */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = e => {
      const text = e.target?.result as string;
      if (!text) return;

      if (this.currentReadingId) {
        this.loadText(text);
      } else {
        const title =
          prompt('Enter a title for this reading:') || file.name;

        const newReading =
          this.readingService.addNewReading({ title, content: text });

        this.currentReadingId = newReading.id;
        this.readingTitle.set(newReading.title);
        this.loadText(text);
      }

      this.wordTableSignal.set([]);
    };

    reader.readAsText(file);
  }

  /** ------------------- 进度 ------------------- */
  getProgressPercent(): number {
    if (this.totalPages === 0) return 0;
    return Math.round(
      (this.currentPageSignal() / this.totalPages) * 100
    );
  }

  /** ------------------- Word Table 导入 / 导出 ------------------- */
  exportWordTable() {
    const blob = new Blob(
      [JSON.stringify(this.wordTableSignal(), null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word_table.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  importWordTable(file: File) {
    if (!this.currentReadingId) return;

    const reader = new FileReader();
    reader.onload = e => {
      const imported = JSON.parse(e.target?.result as string);

      // 更新 service（才是“真相”）
      this.readingService.replaceWordTable(
        this.currentReadingId!,
        imported
      );

      // 同步 UI
      this.wordTableSignal.set([...imported]);
    };

    reader.readAsText(file);
  }

  onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.importWordTable(input.files[0]);
  }

}
