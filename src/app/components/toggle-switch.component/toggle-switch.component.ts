import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss'],
})
export class ToggleSwitchComponent {
  @Input() label: string = '';
  @Input() checked: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checkedChange.emit(input.checked);
  }
}

