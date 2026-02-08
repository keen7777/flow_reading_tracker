import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordEntry } from '../../../models/word-entry';
import { normalizeWord } from '../../../utils/normalizer';
import { tokenize, Token } from '../../../utils/tokenize';


@Component({
  selector: 'app-text-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-display.component.html',
  styleUrls: ['./text-display.component.scss']
})
export class TextDisplayComponent {

  @Input() paragraphs: string[] = [];
  @Input() highlightWords: WordEntry[] = [];
  @Input() highlightMode: 'discrete' | 'continuous' = 'discrete';


  @Output() wordSelected = new EventEmitter<{
    word: string;
    sentence: string;
  }>();

  tokenizedParagraphs: Token[][] = [];

  // ---------- lifecycle ----------
  ngOnChanges(changes: SimpleChanges) {
    if (changes['paragraphs']) {
      this.tokenizedParagraphs = this.paragraphs.map(p =>
        tokenize(p)
      );
    }
  }



  isTokenHighlighted(token: Token): WordEntry | undefined {
    if (token.type !== 'word') return undefined;

    const normalized = normalizeWord(token.text, 'en');
    if (!normalized) return undefined;

    return this.highlightWords.find(
      e => e.word === normalized
    );
  }

  // ---------- click logic ----------
  onTokenClick(token: Token, paragraph: string): void {
    if (token.type !== 'word') return;

    const sentence = this.extractSentence(token.text, paragraph);
    this.wordSelected.emit({
      word: token.text,
      sentence
    });
  }

  private extractSentence(word: string, paragraph: string): string {
    const sentences = paragraph.split(/(?<=[.!?])/);
    return (
      sentences.find(s =>
        s.toLowerCase().includes(word.toLowerCase())
      )?.trim() ?? ''
    );
  }

  // ---------------color mode:
  getTokenHighlightColor(token: Token): string {
    const entry = this.isTokenHighlighted(token);
    if (!entry) return 'transparent';

    if (this.highlightMode === 'discrete') {
      const level = Math.min(entry.count, 5);
      return this.discreteColors[level - 1];
    } else {
      return this.getContinuousColor(entry.count);
    }
  }

  private discreteColors = [
    'hsl(193, 92%, 90%)', // Level 1
    'hsl(193, 91%, 80%)', // Level 2
    'hsl(193, 85%, 70%)', // Level 3
    'hsl(216, 75%, 60%)', // Level 4
    'hsl(219, 99%, 50%)',  // Level 5
  ];
  private getContinuousColor(count: number): string {
    // 限制 count 上限
    const capped = Math.min(count, 5);

    // Hue: 60 -> 5
    const hue = 60 - (50 / 4) * (capped - 1); // 平滑插值
    const saturation = 60 + (30 / 4) * (capped - 1); // 60% -> 90%
    const lightness = 90 - (30 / 4) * (capped - 1); // 90% -> 60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }



}
