import { Component, signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WordEntry } from '../../models/word-entry';
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
    highlightModeDiscreteSignal = signal(false);
    WORDS_PER_PAGE = 200;

    // 现在：全文 → 页 → 段落
    fullTextSignal = signal<string[][]>([]);
    currentPageSignal = signal(1);
    wordTableSignal = signal<WordEntry[]>([]);

    constructor(private sanitizer: DomSanitizer) {
        this.loadDefaultText();
        this.loadFromLocalStorage();
        this.effectUpdatePageContent();
    }

    // ------------------- 默认加载 assets 文本 -------------------
    async loadDefaultText() {
        try {
            const res = await fetch('/assets/docs/pride-and-prejudice-ch01.txt'); // <-- 加了 /
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const text = await res.text();
            this.loadText(text);
        } catch (err) {
            console.error('Failed to load default text', err);
        }
    }


    // ------------------- 加载文本 -------------------
    loadText(text: string) {
        // 1️⃣ 按段落拆分（空行）
        const paragraphs = text
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const pages: string[][] = [];
        let currentPage: string[] = [];
        let wordCount = 0;

        // 2️⃣ 按段落累积，直到 ≥200 词
        for (const para of paragraphs) {
            const paraWordCount = para.split(/\s+/).length;

            if (
                wordCount + paraWordCount > this.WORDS_PER_PAGE &&
                currentPage.length > 0
            ) {
                pages.push(currentPage);
                currentPage = [];
                wordCount = 0;
            }

            currentPage.push(para);
            wordCount += paraWordCount;
        }

        // 3️⃣ 最后一页
        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        this.fullTextSignal.set(pages);
        this.currentPageSignal.set(1);
    }


    // ------------------- 分页相关 -------------------
    get totalPages() {
        return this.fullTextSignal().length;
    }


    get currentPageParagraphs(): string[] {
        return this.fullTextSignal()[this.currentPageSignal() - 1] || [];
    }


    prevPage() {
        if (this.currentPageSignal() > 1) this.currentPageSignal.update(v => v - 1);
    }

    nextPage() {
        if (this.currentPageSignal() < this.totalPages) this.currentPageSignal.update(v => v + 1);
    }
    //------------------after adding text display component----------
    handleWordSelected(event: { word: string, sentence: string }) {
        const now = Date.now();
        const words = this.wordTableSignal();
        const index = words.findIndex(e => e.word.toLowerCase() === event.word.toLowerCase());

        if (index >= 0) {
            words[index].count += 1;
            words[index].lastSeenAt = now;
        } else {
            words.push({
                word: event.word,
                count: 1,
                firstAddedAt: now,
                lastSeenAt: now,
                sentence: event.sentence
            });
        }

        this.wordTableSignal.set([...words]);
    }


    //-------------------delete word-------------------
    deleteWord(entry: WordEntry) {
        const words = this.wordTableSignal().filter(w => w.word !== entry.word);
        this.wordTableSignal.set(words);
    }


    // ------------------- 文件导入 -------------------
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = e => {
                this.loadText(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    }

    // ------------------- 单词表导出/导入 -------------------
    exportWordTable() {
        const blob = new Blob([JSON.stringify(this.wordTableSignal(), null, 2)], {
            type: 'application/json',
        });
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
        const file = input.files[0];
        this.importWordTable(file);
    }


    // ------------------- localStorage -------------------
    saveToLocalStorage() {
        localStorage.setItem('currentPage', this.currentPageSignal().toString());
        localStorage.setItem('wordTable', JSON.stringify(this.wordTableSignal()));
    }

    loadFromLocalStorage() {
        const page = parseInt(localStorage.getItem('currentPage') || '1', 10);
        const table = JSON.parse(localStorage.getItem('wordTable') || '[]');
        this.currentPageSignal.set(page);
        this.wordTableSignal.set(table);
    }

    // ------------------- effect: 自动保存 + 更新高亮 -------------------
    effectUpdatePageContent() {
        effect(() => {
            this.saveToLocalStorage();
        });
    }

    // ------------------- 阅读进度 -------------------
    getProgressPercent(): number {
        if (this.totalPages === 0) return 0;
        return Math.round(
            (this.currentPageSignal() / this.totalPages) * 100
        );
    }

}
