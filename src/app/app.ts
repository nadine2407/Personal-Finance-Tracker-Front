import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass],
  template: `
    <router-outlet />
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999">
      @for (toast of notify.toasts(); track toast) {
        <div class="toast show align-items-center text-white border-0"
             [ngClass]="{'bg-success': toast.type==='success','bg-danger': toast.type==='error','bg-info': toast.type==='info'}">
          <div class="d-flex">
            <div class="toast-body">{{ toast.message }}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="notify.remove(toast)"></button>
          </div>
        </div>
      }
    </div>
  `
})
export class App {
  readonly notify = inject(NotificationService);
  constructor() {
    inject(TranslateService).use('fr');
  }
}
