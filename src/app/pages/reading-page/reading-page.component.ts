import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WordEntry } from '../../models/word-entry';
import { ReadingService } from '../../services/reading.service';
import { VocabularyTableComponent } from '../../components/vocabulary-table/vocabulary-table.component';
import { TextDisplayComponent } from './text-display.component/text-display.component';
import { ToggleSwitchComponent } from '../../components/toggle-switch.component/toggle-switch.component';
import { normalizeWord } from '../../utils/normalizer';


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
  readingTitle = signal('');
  //新增加的当前选中单词：
  currentSelectedWordEntry = signal<WordEntry | null>(null);
  // get from service:
  /** ✅ 永久词条（直接从 service 读取） */
  savedWords = computed(() => {
    if (!this.currentReadingId) return [];

    return (
      this.readingService
        .vocabTablesSignal()[this.currentReadingId]?.entries ?? []
    );
  });

  /** ✅ 临时词条（直接从 service 读取） */
  previewWords = computed(() => {
    if (!this.currentReadingId) return [];

    return (
      this.readingService
        .previewWordTablesSignal()[this.currentReadingId] ?? []
    );
  });


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

  handleWordSelected(event: {
    original: string;
    sentence: string;
    isSaved: boolean;
  }) {
    if (!this.currentReadingId) return;

    const normalized = normalizeWord(event.original, 'en');
    if (!normalized) return;

    //更新当前选中单词：
    this.currentSelectedWordEntry.set({
      original: event.original,
      normalized,
      count: -1,
      firstAddedAt: 0,
      lastSeenAt: 0,
      sentence: event.sentence,
      isSaved: false,
    });

    if (event.isSaved) {
      // ✅ 添加到永久词条
      this.readingService.addWord(
        this.currentReadingId,
        event.original,
        normalized,
        event.sentence
      );

      // ✅ 从 preview 移除（如果存在）
      this.readingService.previewWordTablesSignal.update(tables => {
        const current = tables[this.currentReadingId!] ?? [];

        return {
          ...tables,
          [this.currentReadingId!]:
            current.filter(e => e.normalized !== normalized)
        };
      });

    } else {

      // 如果已经是 saved，不加入 preview
      const alreadySaved =
        this.savedWords().some(e => e.normalized === normalized);

      if (!alreadySaved) {
        this.readingService.addPreviewWord(
          this.currentReadingId,
          event.original,
          normalized,
          event.sentence
        );
      }
    }
  }

  deleteWord(entry: WordEntry) {
    if (!this.currentReadingId) return;

    this.readingService.deleteWord(
      this.currentReadingId,
      entry.normalized
    );
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

      // 1️⃣ 让用户输入标题（如果取消则使用文件名）
      const title =
        prompt('Enter a title for this reading:') || file.name;

      // 2️⃣ 永远创建新的 reading
      const newReading =
        this.readingService.addNewReading({
          title,
          content: text
        });

      // 3️⃣ 切换当前 reading
      this.currentReadingId = newReading.id;
      this.readingTitle.set(newReading.title);

      // 4️⃣ 加载文本分页
      this.loadText(text);
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

  /** ------------------- Word Table 导出 ------------------- */
  exportWordTable() {
    if (!this.currentReadingId) return;

    // 1️⃣ 从 service 读取真实数据
    const table =
      this.readingService
        .vocabTablesSignal()[this.currentReadingId];

    const entries = table?.entries ?? [];

    // 2️⃣ 生成 JSON 文件
    const blob = new Blob(
      [JSON.stringify(entries, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.readingTitle()}_word_table.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
  /** ------------------- Word Table 导入 ------------------- */
  importWordTable(file: File) {
    if (!this.currentReadingId) return;

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target?.result as string);

        // 1️⃣ 基本结构校验（防止崩溃）
        if (!Array.isArray(imported)) {
          alert('Invalid word table format.');
          return;
        }

        // 2️⃣ 更新 service（唯一数据源）
        this.readingService.replaceWordTable(
          this.currentReadingId!,
          imported
        );

        alert('Word table imported successfully.');

      } catch (err) {
        alert('Failed to import word table.');
        console.error(err);
      }
    };

    reader.readAsText(file);
  }


  onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.importWordTable(input.files[0]);
  }

}
