import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  constructor(public confirmService: ConfirmDialogService) {}

  getIcon(): string {
    const type = this.confirmService.config()?.type;
    if (type === 'danger') return '🗑️';
    if (type === 'warning') return '⚠️';
    if (type === 'error') return '⛔';
    return 'ℹ️';
  }

  onConfirm(): void {
    const config = this.confirmService.config();
    if (config?.requireInput && !this.confirmService.inputValue().trim()) {
      return;
    }
    this.confirmService.respond(true);
  }

  get inputInvalido(): boolean {
    const config = this.confirmService.config();
    return !!config?.requireInput && !this.confirmService.inputValue().trim();
  }
}
