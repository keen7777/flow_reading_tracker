import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';
import { ReadingPageComponent } from './pages/reading-page/reading-page.component';
import { VocabularyListComponent } from './pages/vocabulary-list/vocabulary-list.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'reading-list', component: ReadingListComponent },
  { path: 'reading/:id', component: ReadingPageComponent },
  { path: 'vocabulary-list', component: VocabularyListComponent },
  { path: '**', redirectTo: '' }
];
