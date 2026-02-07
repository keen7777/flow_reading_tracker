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
  
}
