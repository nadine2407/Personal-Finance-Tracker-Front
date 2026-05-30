import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private resolveFn?: (val: boolean) => void;
  readonly visible = signal(false);
  readonly message = signal('');

  confirm(message: string): Promise<boolean> {
    this.message.set(message);
    this.visible.set(true);
    return new Promise(resolve => { this.resolveFn = resolve; });
  }

  accept() { this.visible.set(false); this.resolveFn?.(true); }
  cancel() { this.visible.set(false); this.resolveFn?.(false); }
}
