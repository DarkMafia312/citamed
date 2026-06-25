import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: Toast['type'] = 'success', duration = 3500): void {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  remove(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
