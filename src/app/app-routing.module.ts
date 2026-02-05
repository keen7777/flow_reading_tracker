import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ReadingListComponent } from './pages/reading-list/reading-list.component';
import { VocabularyListComponent } from './pages/vocabulary-list/vocabulary-list.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'reading-list', component: ReadingListComponent },
  { path: 'vocabulary-list', component: VocabularyListComponent },
  { path: '**', redirectTo: '' }
];
