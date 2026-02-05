import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <h2>Welcome to Flow Reading Tracker</h2>
    <p>This is the home page.</p>
  `,
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {}
