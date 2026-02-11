import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DictionaryService {

  private cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  fetchDefinition(word: string): Observable<string> {

    // ✅ 先查缓存
    if (this.cache.has(word)) {
      return of(this.cache.get(word)!);
    }

    // ✅ 请求 API
    return this.http
      .get<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .pipe(
        map(data =>
          data[0]?.meanings[0]?.definitions[0]?.definition ?? ''
        ),
        tap(definition => {
          // 存缓存
          this.cache.set(word, definition);
        })
      );
  }
}
