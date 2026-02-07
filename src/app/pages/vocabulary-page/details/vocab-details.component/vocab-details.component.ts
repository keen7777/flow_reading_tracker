import { Component, Input, Signal, effect, computed } from '@angular/core';
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
  /** ------------------- 输入属性 ------------------- */
  @Input({ required: true }) tableId!: string;

  /** ------------------- 自动计算的词表条目 ------------------- */
  wordEntriesSignal: Signal<WordEntry[]>;

  constructor(private readingService: ReadingService) {
    // 使用 computed 创建响应式信号
    // 只要 tableId 或 service 内的 vocabTablesSignal 改变，都会自动更新
    this.wordEntriesSignal = computed(() => {
      // 获取当前 tableId 对应的词表
      const table = this.readingService.vocabTablesSignal()[this.tableId];
      // 返回 entries，如果词表不存在则返回空数组
      return table?.entries ?? [];
    });

    /** 可选：如果需要在 tableId 变化时做额外操作，可以用 effect */
    effect(() => {
      const entries = this.wordEntriesSignal();
      console.log(`VocabDetails updated, ${entries.length} words for tableId:`, this.tableId);
    });
  }
}
