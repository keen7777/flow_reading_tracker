import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReadingService } from '../../services/reading.service';
import { ReadingItem } from '../../models/reading-item';

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss'],
})
export class ReadingListComponent {

  constructor(private readingService: ReadingService) { }

  /** ------------------- 使用 getter 动态获取最新文章列表 ------------------- */
  get readings(): ReadingItem[] {
    return this.readingService.allReadings(); // 注意调用 computed 得到当前值
  }


  /** ------------------- 本地上传文件创建新文章 ------------------- */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = e => {
      const content = e.target?.result as string;
      if (!content) return;

      const title = prompt('Enter a title for this reading:');
      if (!title) return;

      // 创建新文章，直接用 content，不需要 assetPath
      this.readingService.addNewReading({ title, content });

      // getter 会自动返回最新列表，无需手动刷新
    };

    reader.readAsText(file);
  }
  // delete one reading item:
   /** 删除文章（连同词表） */
  deleteReading(readingId: string) {
    if (!confirm('Delete this reading and its word table?')) return;
    this.readingService.deleteReading(readingId);
  }

}
