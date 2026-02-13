import { Component, Input, Output, EventEmitter, signal, computed, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordEntry } from '../../models/word-entry';

@Component({
  selector: 'app-vocabulary-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocabulary-table.component.html',
  styleUrls: ['./vocabulary-table.component.scss'],
})
export class VocabularyTableComponent {
  words = input<WordEntry[]>([]);

  @Input() allowDelete = false;
  @Input() allowSort = false;

  @Output() deleteWord = new EventEmitter<WordEntry>();
  @Output() sortChange = new EventEmitter<string>();

  // Signal 保存当前排序方式
  sortType = signal<'firstSeen' | 'lastSeen' | 'count' | 'alpha'>('firstSeen');

  // 排序后的列表
  sortedWords = computed(() => {
    const wordsCopy = [...this.words()];
    switch (this.sortType()) {
      case 'firstSeen':
        return wordsCopy.sort((a, b) => (a.firstAddedAt ?? 0) - (b.firstAddedAt ?? 0));
      case 'lastSeen':
        return wordsCopy.sort((a, b) => (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0));
      case 'count':
        return wordsCopy.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
      case 'alpha':
        return wordsCopy.sort((a, b) => a.normalized.localeCompare(b.normalized));
      default:
        return wordsCopy;
    }
  });

  onDelete(entry: WordEntry) {
    if (!confirm(`Delete "${entry.normalized}"?`)) return;
    this.deleteWord.emit(entry);
  }

  onSortChange(type: 'firstSeen' | 'lastSeen' | 'count' | 'alpha') {
    this.sortType.set(type);
    this.sortChange.emit(type);
  }
}

