import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VocabularyTable } from '../../models/vocabulary-table';
import { ReadingService } from '../../services/reading.service';
import { VocabDetailsComponent } from './details/vocab-details.component/vocab-details.component'; 
import { VocabSidebarComponent } from './sidebar/vocab-sidebar.component/vocab-sidebar.component';

@Component({
  selector: 'app-vocabulary-page',
  standalone: true,
  imports: [CommonModule, VocabSidebarComponent, VocabDetailsComponent],
  templateUrl: './vocabulary-page.component.html',
  styleUrls: ['./vocabulary-page.component.scss']
})
export class VocabularyPageComponent {
  // signal: 当前选中的词表 ID
  selectedTableId = signal<string | null>(null);

  constructor(public readingService: ReadingService) {}
}
