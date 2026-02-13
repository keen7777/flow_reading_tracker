import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordEntry } from '../../../models/word-entry';
import { normalizeWord } from '../../../utils/normalizer';
import { tokenize, Token } from '../../../utils/tokenize';
import { TextDisplayDirective } from '../text-display.directive/text-display.directive';


@Component({
  selector: 'app-text-display',
  standalone: true,
  imports: [CommonModule, TextDisplayDirective],
  templateUrl: './text-display.component.html',
  styleUrls: ['./text-display.component.scss']
})
export class TextDisplayComponent {

  @Input() paragraphs: string[] = [];
  @Input() savedWords: WordEntry[] = [];
  @Input() previewWords: WordEntry[] = [];
  @Input() highlightMode: 'discrete' | 'continuous' = 'discrete';


  @Output() wordSelected = new EventEmitter<{
    original: string;
    sentence: string;
    isSaved: boolean;
  }>();

  tokenizedParagraphs: Token[][] = [];
  /** 临时词条表，用 token.text 作为 key */
  previewEntries: Record<string, WordEntry> = {};

  /** 永久词条表，用 token.text 作为 key */
  savedEntries: Record<string, WordEntry> = {};

  // ---------- lifecycle ----------
  ngOnChanges(changes: SimpleChanges) {
    if (changes['paragraphs']) {
      this.tokenizedParagraphs = this.paragraphs.map(p =>
        tokenize(p)
      );
    }
  }

  //转换成 Map 方便 directive 查找
  get savedEntriesMap(): Record<string, WordEntry> {
    return Object.fromEntries(this.savedWords.map(e => [e.normalized, e]));
  }

  get previewEntriesMap(): Record<string, WordEntry> {
    return Object.fromEntries(this.previewWords.map(e => [e.normalized, e]));
  }
  
  normalizeToken(token: Token): string {
    return normalizeWord(token.text);
  }


  /** 获取当前 token 对应的 PreviewWord 或 WordEntry */
  // ---------- click logic ----------
  onTokenLeftClick(token: Token, paragraph: string): void {
    if (token.type !== 'word') return;

    const sentence = this.extractSentence(token.text, paragraph);
    this.wordSelected.emit({
      original: token.text,
      sentence,
      isSaved: false
    });
  }

  onTokenRightClick(token: Token, paragraph: string): void {
    if (token.type !== 'word') return;

    const sentence = this.extractSentence(token.text, paragraph);
    this.wordSelected.emit({
      original: token.text,
      sentence,
      isSaved: true
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

}
