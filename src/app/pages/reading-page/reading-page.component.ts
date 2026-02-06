import { Component, effect, signal, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// interface of word
interface WordEntry {
    word: string;
    count: number;
    sentence?: string;
    definition?: string; // later usages
}

@Component({
    selector: 'app-reading-page',
    standalone: true,
    templateUrl: './reading-page.component.html',
    styleUrls: ['./reading-page.component.scss']
})
export class ReadingPageComponent {

    // -------------------
    // Signals
    // -------------------
    WORDS_PER_PAGE = 200;

    fullTextSignal = signal<string[]>([]); // current page's word
    currentPageSignal = signal(1);         // current page number
    wordTableSignal = signal<WordEntry[]>([]); // word table
    sanitizedContentSignal = signal<SafeHtml>(''); // sanitize current page highlight

    totalPages = computed(() => {
        return Math.ceil(this.fullTextSignal().length / this.WORDS_PER_PAGE);
    });


    constructor(private sanitizer: DomSanitizer) {
        this.loadFromLocalStorage(); // load the reading history progress from storage
        this.effectUpdatePageContent(); // update current page if sth has changed
    }

    // -------------------
    // method: load text（from github or paste by user）
    // -------------------
    loadText(text: string) {
        // split to get single word
        const words = text.split(/\s+/);
        this.fullTextSignal.set(words);
        this.currentPageSignal.set(1);
        this.updateSanitizedPage();
    }

    // -------------------
    // method：get current page's context
    // -------------------
    getCurrentPageWords(): string[] {
        const start = (this.currentPageSignal() - 1) * this.WORDS_PER_PAGE;
        return this.fullTextSignal().slice(start, start + this.WORDS_PER_PAGE);
    }

    // -------------------
    // method: update sanitizedContentSignal（for innerHTML's highlight）
    // -------------------
    updateSanitizedPage() {
        const pageText = this.getCurrentPageWords().join(' ');

        // highlight known word
        let highlighted = pageText;
        this.wordTableSignal().forEach(entry => {
            const regex = new RegExp(`\\b${entry.word}\\b`, 'gi');
            highlighted = highlighted.replace(regex,
                `<span class="highlight" style="background-color:rgba(255,255,0,${Math.min(0.2 + 0.2 * entry.count, 1)})">${entry.word}</span>`);
        });

        this.sanitizedContentSignal.set(this.sanitizer.bypassSecurityTrustHtml(highlighted));
    }

    // -------------------
    // method：select the word
    // -------------------
    handleTextSelection() {
        const selection = window.getSelection()?.toString().trim();
        if (!selection) return;

        const words = this.wordTableSignal();
        const index = words.findIndex(e => e.word.toLowerCase() === selection.toLowerCase());

        // get the original sentence
        const sentence = this.getCurrentSentence(selection);

        if (index >= 0) {
            words[index].count += 1; // already exist word, then cnt+1
        } else {
            words.push({ word: selection, count: 1, sentence });
        }
        this.wordTableSignal.set([...words]);
        this.updateSanitizedPage();
    }

    // -------------------
    // method：get the original sentence from the text, use simple punctuation to trim
    // -------------------
    getCurrentSentence(word: string): string {
        const text = this.getCurrentPageWords().join(' ');
        const sentences = text.split(/[.!?]/);
        for (let s of sentences) {
            if (s.includes(word)) return s.trim();
        }
        return '';
    }

    // -------------------
    // splitting pages
    // -------------------
    prevPage() {
        if (this.currentPageSignal() > 1) this.currentPageSignal.update(v => v - 1);
        this.updateSanitizedPage();
    }

    nextPage() {
        if (this.currentPageSignal() < this.totalPages()) {
            this.currentPageSignal.update(v => v + 1);
        }
        this.updateSanitizedPage();
    }

    // -------------------
    // export
    // -------------------
    exportWordTable() {
        const blob = new Blob([JSON.stringify(this.wordTableSignal(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'word_table.json';
        a.click();
    }

    // -------------------
    // import wordtable
    // -------------------
    importWordTable(file: File) {
        const reader = new FileReader();
        reader.onload = e => {
            const imported: WordEntry[] = JSON.parse(e.target?.result as string);
            this.wordTableSignal.set(imported);
            // after import, refresh to update the highlight
            this.updateSanitizedPage();
        };
        reader.readAsText(file);
    }

    // -------------------
    // localstorage, save and load
    // -------------------
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

    // -------------------
    // effect：current page changes or vocabulary-list changes
    // -------------------
    effectUpdatePageContent() {
        effect(() => {
            this.updateSanitizedPage();
            this.saveToLocalStorage();
        });
    }

    // -------------------
    // reading progress
    // -------------------
    getProgressPercent(): number {
        return Math.min(100, (this.currentPageSignal() * this.WORDS_PER_PAGE / this.fullTextSignal().length) * 100);
    }
}
