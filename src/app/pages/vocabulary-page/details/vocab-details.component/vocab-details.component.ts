import { Component, Input, Signal, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingService } from '../../../../services/reading.service';
import { WordEntry } from '../../../../models/word-entry';

@Component({
  selector: 'app-vocab-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocab-details.component.html'
})
export class VocabDetailsComponent {

  /** 输入属性，用 signal 包装 */
  private _tableIdSignal = signal<string | null>(null);

  @Input()
  set tableId(value: string | null) {
    this._tableIdSignal.set(value);
  }
  get tableId(): string | null {
    return this._tableIdSignal();
  }

  /** 自动计算词表条目 */
  wordEntriesSignal: Signal<WordEntry[]>;

  constructor(private readingService: ReadingService) {
    // 依赖 tableIdSignal 和 service 的 vocabTablesSignal
    this.wordEntriesSignal = computed(() => {
      const id = this._tableIdSignal();
      if (!id) return [];
      const table = this.readingService.vocabTablesSignal()[id];
      return table?.entries ?? [];
    });

    // 可选：监听变化调试
    effect(() => {
      console.log(`VocabDetails updated, tableId: ${this._tableIdSignal()}, words:`, this.wordEntriesSignal().length);
    });
  }

  /** 删除单词 */
  deleteWord(entry: WordEntry) {
    const id = this._tableIdSignal();
    if (!id) return;
    if (!confirm(`Delete word "${entry.normalized}"?`)) return;
    this.readingService.deleteWord(id, entry.normalized);
  }
}
