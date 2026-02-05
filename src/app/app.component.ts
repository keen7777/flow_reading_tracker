import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // RouterOutlet 用于路由渲染
  template: `
    <h1>{{ title() }}</h1>
    <nav>
      <a routerLink="">Home</a> |
      <a routerLink="reading-list">Reading List</a> |
      <a routerLink="vocabulary-list">Vocabulary List</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected readonly title = signal('Flow Reading Tracker');
}
