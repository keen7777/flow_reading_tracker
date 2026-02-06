import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordEntry } from '../../models/word-entry';

@Component({
  selector: 'app-vocabulary-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocabulary-table.component.html'
})
export class VocabularyTableComponent {
  @Input() words: WordEntry[] = [];

  @Input() allowDelete = false;
  @Input() allowSort = false;

  @Output() deleteWord = new EventEmitter<WordEntry>();
  @Output() sortChange = new EventEmitter<string>();

  onDelete(entry: WordEntry) {
    if (!confirm(`Delete "${entry.word}"?`)) return;
    this.deleteWord.emit(entry);
  }

  onSortChange(type: string) {
    this.sortChange.emit(type);
  }
}

