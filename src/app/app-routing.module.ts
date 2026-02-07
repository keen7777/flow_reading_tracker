import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';
import { ReadingPageComponent } from './pages/reading-page/reading-page.component';
import { VocabularyPageComponent } from './pages/vocabulary-page/vocabulary-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'reading-list', component: ReadingListComponent },
  { path: 'reading/:id', component: ReadingPageComponent },
  { path: 'vocabulary-page', component: VocabularyPageComponent },
  { path: '**', redirectTo: '' }
];
