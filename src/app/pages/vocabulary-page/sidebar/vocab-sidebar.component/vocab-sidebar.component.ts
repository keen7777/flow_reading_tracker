import { Component, EventEmitter, Output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingService } from '../../../../services/reading.service';
import { VocabularyTable } from '../../../../models/vocabulary-table';




@Component({
  selector: 'app-vocab-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocab-sidebar.component.html'
})
export class VocabSidebarComponent {

  /** 通知父组件选中的 readingId */
  @Output() selectTable = new EventEmitter<string>();
  

  /** ⚠️ 直接订阅 service 的 signal */
  vocabTablesSignal: Signal<VocabularyTable[]>;

  constructor(private readingService: ReadingService) {
    this.vocabTablesSignal = this.readingService.allVocabTablesSignal;
  }

  select(table: VocabularyTable) {
    this.selectTable.emit(table.readingId);
  }

   /** 删除整张词表 */
  deleteTable(table: VocabularyTable) {
    if (!confirm(`Delete the entire word table "${table.name}"?`)) return;

    // 调用 service 删除
    this.readingService.deleteVocabTable(table.readingId);
    
    // 如果当前选中的表是删除的表，可以通知父组件清空 detail
    if (this.selectTable) this.selectTable.emit(null as any);
  }
  
}
