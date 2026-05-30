import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-3"></i>
      <p class="mb-3">{{ messageKey | translate }}</p>
      <ng-content />
    </div>
  `
})
export class EmptyStateComponent {
  @Input() messageKey = '';
  @Input() icon = '';
}
