import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgFor 所在模块
import { ReadingService } from '../../services/reading.service';
import { VocabularyTable } from '../../models/vocabulary-table';

@Component({
  selector: 'app-vocabulary-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocabulary-page.component.html'
})
export class VocabularyPageComponent {
  constructor(private readingService: ReadingService) {}

  get vocabTables(): VocabularyTable[] {
    return this.readingService.getAllVocabTables();
  }

  deleteTable(readingId: string) {
    if (!confirm('Delete this word table only?')) return;
    this.readingService.deleteVocabTable(readingId);
  }
}

