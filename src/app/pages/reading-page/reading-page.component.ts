import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WordEntry } from '../../models/word-entry';
import { ReadingService } from '../../services/reading.service';
import { VocabularyTableComponent } from '../../components/vocabulary-table/vocabulary-table.component';
import { TextDisplayComponent } from './text-display.component/text-display.component';
import { ToggleSwitchComponent } from '../../components/toggle-switch.component/toggle-switch.component';

@Component({
  selector: 'app-reading-page',
  standalone: true,
  imports: [CommonModule, VocabularyTableComponent, TextDisplayComponent, ToggleSwitchComponent],
  templateUrl: './reading-page.component.html',
  styleUrls: ['./reading-page.component.scss'],
})
export class ReadingPageComponent {
  /** ------------------- Signals ------------------- */
  highlightModeDiscreteSignal = signal(false);       // 高亮模式
  fullTextSignal = signal<string[][]>([]);          // 文本分页后的二维数组
  currentPageSignal = signal(1);                    // 当前页
  wordTableSignal = signal<WordEntry[]>([]);        // 当前词表
  readingTitle = signal('');                        // 当前文章标题
  currentReadingId: string | null = null;          // 当前文章 ID
  WORDS_PER_PAGE = 200;                             // 每页单词数量限制

  constructor(
    private route: ActivatedRoute,
    private readingService: ReadingService
  ) {}

  /** ------------------- 初始化 ------------------- */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.currentReadingId = id;

    const reading = this.readingService.getReadingById(id);
    if (!reading) return;

    this.readingTitle.set(reading.title);

    // 如果已有文本内容，直接分页显示
    if (reading.content) {
      this.loadText(reading.content);
    }

    // 加载已有词表
    const vocab = this.readingService.getVocabByReadingId(id);
    if (vocab) this.wordTableSignal.set([...vocab.entries]);
  }

  /** ------------------- 文本分页 ------------------- */
  loadText(text: string) {
    if (this.currentReadingId) {
      const reading = this.readingService.getReadingById(this.currentReadingId);
      if (reading) reading.content = text;   // 保存文本到 service
    }

    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    const pages: string[][] = [];
    let currentPage: string[] = [];
    let wordCount = 0;

    for (const para of paragraphs) {
      const paraWordCount = para.split(/\s+/).length;
      if (wordCount + paraWordCount > this.WORDS_PER_PAGE && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        wordCount = 0;
      }
      currentPage.push(para);
      wordCount += paraWordCount;
    }

    if (currentPage.length > 0) pages.push(currentPage);

    this.fullTextSignal.set(pages);
    this.currentPageSignal.set(1);
  }

  /** ------------------- 分页导航 ------------------- */
  get totalPages() { return this.fullTextSignal().length; }
  get currentPageParagraphs(): string[] { return this.fullTextSignal()[this.currentPageSignal() - 1] || []; }
  prevPage() { if (this.currentPageSignal() > 1) this.currentPageSignal.update(v => v - 1); }
  nextPage() { if (this.currentPageSignal() < this.totalPages) this.currentPageSignal.update(v => v + 1); }

  /** ------------------- 单词操作 ------------------- */
  handleWordSelected(event: { word: string, sentence: string }) {
    if (!this.currentReadingId) return;
    this.readingService.addWord(this.currentReadingId, event.word, event.sentence);
    const vocab = this.readingService.getVocabByReadingId(this.currentReadingId);
    if (vocab) this.wordTableSignal.set([...vocab.entries]);
  }

  deleteWord(entry: WordEntry) {
    if (!this.currentReadingId) return;
    this.readingService.deleteWord(this.currentReadingId, entry.word);
    const vocab = this.readingService.getVocabByReadingId(this.currentReadingId);
    if (vocab) this.wordTableSignal.set([...vocab.entries]);
  }

  /** ------------------- 上传本地 txt 文件 ------------------- */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = e => {
      const text = e.target?.result as string;
      if (!text) return;

      // 如果已有 ID，则替换当前文章文本
      if (this.currentReadingId) {
        this.loadText(text);
      } else {
        // 创建新阅读条目
        const title = prompt('Enter a title for this reading:') || file.name;
        const newReading = this.readingService.addNewReading({ title, content: text });
        this.currentReadingId = newReading.id;
        this.readingTitle.set(newReading.title);
        this.loadText(text);
      }

      // 重置词表
      this.wordTableSignal.set([]);
    };

    reader.readAsText(file);
  }

  /** ------------------- Word Table 导入/导出 ------------------- */
  exportWordTable() {
    const blob = new Blob([JSON.stringify(this.wordTableSignal(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word_table.json';
    a.click();
  }

  importWordTable(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const imported: WordEntry[] = JSON.parse(e.target?.result as string);
      this.wordTableSignal.set(imported);
    };
    reader.readAsText(file);
  }

  onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.importWordTable(input.files[0]);
  }

  /** ------------------- 阅读进度 ------------------- */
  getProgressPercent(): number {
    if (this.totalPages === 0) return 0;
    return Math.round((this.currentPageSignal() / this.totalPages) * 100);
  }
}
