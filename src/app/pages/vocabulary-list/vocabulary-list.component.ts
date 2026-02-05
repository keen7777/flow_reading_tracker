import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgFor 所在模块

@Component({
  selector: 'app-vocabulary-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Vocabulary List</h2>
    <ul>
      <li *ngFor="let item of vocabularyItems">{{ item }}</li>
    </ul>
  `,
  styleUrls: ['./vocabulary-list.component.scss']
})
export class VocabularyListComponent {
  vocabularyItems = ['Word 1', 'Word 2', 'Word 3'];
}

