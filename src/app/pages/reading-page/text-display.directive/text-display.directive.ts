import { Directive, Input, Output, EventEmitter, HostBinding, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { WordEntry } from '../../../models/word-entry';


@Directive({
  selector: '[appWordHighlight]',
  standalone: true
})
export class TextDisplayDirective {

  @Input() previewEntry?: WordEntry; // 临时词条
  @Input() savedEntry?: WordEntry;// 永久词条
  /** 高亮模式 */
  @Input() mode: 'discrete' | 'continuous' = 'discrete';


  @Output() leftClick = new EventEmitter<void>();
  @Output() rightClick = new EventEmitter<void>();

  @HostListener('click') onLeft() { this.leftClick.emit(); }
  @HostListener('contextmenu', ['$event']) onRight(e: MouseEvent) { e.preventDefault(); this.rightClick.emit(); }


  /** 高亮颜色绑定 */
  @HostBinding('style.backgroundColor') backgroundColor: string = 'transparent';

  ngOnChanges(changes: SimpleChanges) {
    // 当输入更新时重新计算高亮
    this.updateBackground();
  }
  private updateBackground() {
    if (this.previewEntry) {
      this.backgroundColor = 'hsl(272, 95%, 78%)';
      console.log(' priview  color!!!!!');
    } else if (this.savedEntry) {
      console.log('saved color!!!!!');
      console.log(`save word: ${this.savedEntry.word}`);
      console.log(`save word count: ${this.savedEntry.count}`);
      console.log(`save word save?: ${this.savedEntry.isSaved}`);
      const count = this.savedEntry.count ?? 1;
      this.backgroundColor =
        this.mode === 'discrete'
          ? this.getDiscreteColor(count)
          : this.getContinuousColor(count);
    } else {
      this.backgroundColor = 'transparent';
    }
  }


  /** 根据词条状态绑定背景色 
  @HostBinding('style.backgroundColor')
  get backgroundColor(): string {
    console.log('color!!!!!');
    console.log(`${this.previewEntry?.normalized}`)
    // 临时高亮（未保存）
    if (this.previewEntry) {
      return 'hsl(255, 81%, 79%)'; // 临时高亮色
    }

    // 永久高亮（已保存）
    if (this.savedEntry) {
      const count = this.savedEntry.count ?? 1;
      return this.mode === 'discrete'
        ? this.getDiscreteColor(this.savedEntry.count)
        : this.getContinuousColor(this.savedEntry.count);
    }
    return 'transparent';
  }
     */

  private getDiscreteColor(count: number): string {
    const colors = [
      'hsl(193, 92%, 90%)',
      'hsl(193, 91%, 80%)',
      'hsl(193, 85%, 70%)',
      'hsl(216, 75%, 60%)',
      'hsl(219, 99%, 50%)',
    ];
    return colors[Math.min(count, 5) - 1];
  }

  private getContinuousColor(count: number): string {
    const capped = Math.min(count, 5);
    const hue = 60 - (50 / 4) * (capped - 1);
    const saturation = 60 + (30 / 4) * (capped - 1);
    const lightness = 90 - (30 / 4) * (capped - 1);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

}
