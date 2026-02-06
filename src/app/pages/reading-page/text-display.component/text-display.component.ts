import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WordEntry } from '../../../models/word-entry';

@Component({
  selector: 'app-text-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-display.component.html',
  styleUrls: ['./text-display.component.scss']
})
export class TextDisplayComponent {
  @Input() pageText: string = '';
  @Input() highlightWords: WordEntry[] = [];

  @Output() wordSelected = new EventEmitter<{ word: string, sentence: string }>();

  sanitizedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.updateSanitizedHtml();
  }

  updateSanitizedHtml() {
    let highlighted = this.pageText;
    this.highlightWords.forEach(entry => {
      const regex = new RegExp(`\\b${entry.word}\\b`, 'gi');
      highlighted = highlighted.replace(
        regex,
        `<span class="highlight" style="background-color:rgba(255,255,0,${Math.min(0.2 + 0.2 * entry.count, 1)})">${entry.word}</span>`
      );
    });
    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  onMouseUp() {
    const selection = window.getSelection()?.toString().trim();
    if (!selection) return;

    // 获取选中单词所在句子（简单方案：用标点分割）
    const sentences = this.pageText.split(/[.!?]/);
    const sentence = sentences.find(s => s.includes(selection))?.trim() || '';

    this.wordSelected.emit({ word: selection, sentence });
  }
}
