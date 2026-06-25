import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'error';
  requireInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

export interface ConfirmResult {
  confirmed: boolean;
  inputValue?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  config = signal<ConfirmConfig | null>(null);
  inputValue = signal<string>('');
  private resolver: ((value: ConfirmResult) => void) | null = null;

  confirm(config: ConfirmConfig): Promise<ConfirmResult> {
    this.config.set(config);
    this.inputValue.set('');
    return new Promise(resolve => {
      this.resolver = resolve;
    });
  }

  respond(confirmed: boolean): void {
    const result: ConfirmResult = {
      confirmed,
      inputValue: this.inputValue()
    };
    this.config.set(null);
    if (this.resolver) {
      this.resolver(result);
      this.resolver = null;
    }
  }
}
