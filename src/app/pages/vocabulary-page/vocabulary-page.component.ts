import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  /** 当前选中的词表 ID，空字符串表示未选择 */
  selectedTableId = signal<string>('');
}
