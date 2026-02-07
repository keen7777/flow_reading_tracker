import { Component, Input, Signal, computed } from '@angular/core';
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

  /** 父组件传入的 readingId */
  @Input({ required: true }) tableId!: string;

  /** 当前词表 entries（自动更新） */
  wordEntriesSignal: Signal<WordEntry[]>;

  constructor(private readingService: ReadingService) {
    this.wordEntriesSignal = computed(() => {
      const table =
        this.readingService.vocabTablesSignal()[this.tableId];
      return table?.entries ?? [];
    });
  }
}
