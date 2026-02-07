import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingService } from '../../../../services/reading.service'; 
import { VocabularyTable } from '../../../../models/vocabulary-table'; 

@Component({
  selector: 'app-vocab-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocab-sidebar.component.html',
  styleUrls: ['./vocab-sidebar.component.scss']
})
export class VocabSidebarComponent {
  @Input() selectedTableId: any; // signal 绑定
  @Output() selectTable = new EventEmitter<string>();

  constructor(public readingService: ReadingService) {}

  get tables(): VocabularyTable[] {
    return this.readingService.getAllVocabTables();
  }

  onSelectTable(tableId: string) {
    this.selectTable.emit(tableId);
  }

  deleteTable(tableId: string) {
    if (!confirm('Delete this word table only?')) return;
    this.readingService.deleteVocabTable(tableId);

    // 如果删除的是当前选中，清空选中
    if (this.selectedTableId() === tableId) {
      this.selectTable.emit('');
    }
  }

  getWordCount(table: VocabularyTable): number {
    return table.entries.length;
  }
}
