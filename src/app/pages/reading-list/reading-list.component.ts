import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgFor 所在模块

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Reading List</h2>
    <ul>
      <li *ngFor="let item of readingItems">{{ item }}</li>
    </ul>
  `,
  styleUrls: ['./reading-list.component.scss']
})
export class ReadingListComponent {
  readingItems = ['Book 1', 'Book 2', 'Book 3'];
}
