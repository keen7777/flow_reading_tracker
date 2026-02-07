import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingService } from '../../../../services/reading.service';
import { WordEntry } from '../../../../models/word-entry';

@Component({
  selector: 'app-vocab-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocab-details.component.html',
  styleUrls: ['./vocab-details.component.scss']
})
export class VocabDetailsComponent {
  @Input() tableId: any; // signal 绑定

  constructor(public readingService: ReadingService) {}

  get entries(): WordEntry[] {
    if (!this.tableId()) return [];
    const table = this.readingService.getVocabByReadingId(this.tableId());
    return table?.entries || [];
  }

  deleteWord(word: string) {
    if (!this.tableId()) return;
    this.readingService.deleteWord(this.tableId(), word);
  }
}
