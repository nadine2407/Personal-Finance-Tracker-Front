import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0 fw-bold">{{ titleKey | translate }}</h2>
      <div class="d-flex gap-2"><ng-content /></div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() titleKey = '';
}
