import { Component, signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';

interface WordEntry {
    word: string;
    count: number;
    sentence?: string;
    definition?: string; // future usage
}

@Component({
    selector: 'app-reading-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reading-page.component.html',
    styleUrls: ['./reading-page.component.scss'],
})
export class ReadingPageComponent {
    WORDS_PER_PAGE = 50;

    fullTextSignal = signal<string[]>([]); // 全文拆词
    currentPageSignal = signal(1);
    wordTableSignal = signal<WordEntry[]>([]);
    sanitizedContentSignal = signal<SafeHtml>(''); // 当前页高亮内容

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
        const words = text.split(/\s+/);
        this.fullTextSignal.set(words);
        this.currentPageSignal.set(1);
        this.updateSanitizedPage();
    }

    // ------------------- 分页相关 -------------------
    get totalPages() {
        return Math.ceil(this.fullTextSignal().length / this.WORDS_PER_PAGE);
    }

    getCurrentPageWords(): string[] {
        const start = (this.currentPageSignal() - 1) * this.WORDS_PER_PAGE;
        return this.fullTextSignal().slice(start, start + this.WORDS_PER_PAGE);
    }

    prevPage() {
        if (this.currentPageSignal() > 1) this.currentPageSignal.update(v => v - 1);
        this.updateSanitizedPage();
    }

    nextPage() {
        if (this.currentPageSignal() < this.totalPages) this.currentPageSignal.update(v => v + 1);
        this.updateSanitizedPage();
    }

    // ------------------- 高亮和单词表 -------------------
    updateSanitizedPage() {
        const pageText = this.getCurrentPageWords().join(' ');

        let highlighted = pageText;
        this.wordTableSignal().forEach(entry => {
            const regex = new RegExp(`\\b${entry.word}\\b`, 'gi');
            highlighted = highlighted.replace(
                regex,
                `<span class="highlight" style="background-color:rgba(255,255,0,${Math.min(
                    0.2 + 0.2 * entry.count,
                    1
                )})">${entry.word}</span>`
            );
        });

        this.sanitizedContentSignal.set(this.sanitizer.bypassSecurityTrustHtml(highlighted));
    }

    handleTextSelection() {
        const selection = window.getSelection()?.toString().trim();
        if (!selection) return;

        const words = this.wordTableSignal();
        const index = words.findIndex(e => e.word.toLowerCase() === selection.toLowerCase());

        const sentence = this.getCurrentSentence(selection);

        if (index >= 0) {
            words[index].count += 1; // 已存在单词，次数 +1
        } else {
            words.push({ word: selection, count: 1, sentence });
        }

        this.wordTableSignal.set([...words]);
        this.updateSanitizedPage();
    }

    getCurrentSentence(word: string): string {
        const text = this.getCurrentPageWords().join(' ');
        const sentences = text.split(/[.!?]/);
        for (let s of sentences) {
            if (s.includes(word)) return s.trim();
        }
        return '';
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
            this.updateSanitizedPage();
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
            this.updateSanitizedPage();
            this.saveToLocalStorage();
        });
    }

    // ------------------- 阅读进度 -------------------
    getProgressPercent(): number {
        return Math.min(
            100,
            (this.currentPageSignal() * this.WORDS_PER_PAGE) / this.fullTextSignal().length * 100
        );
    }
}
