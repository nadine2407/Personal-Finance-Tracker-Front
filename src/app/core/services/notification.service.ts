import { Injectable, signal } from '@angular/core';

export interface Toast { message: string; type: 'success' | 'error' | 'info' }

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }

  remove(toast: Toast) { this.toasts.update(ts => ts.filter(t => t !== toast)); }

  private show(message: string, type: Toast['type']) {
    const toast: Toast = { message, type };
    this.toasts.update(ts => [...ts, toast]);
    setTimeout(() => this.remove(toast), 4000);
  }
}
