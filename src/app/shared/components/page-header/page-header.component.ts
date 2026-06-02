import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="page-header-block">
      <h2 class="page-header-block__title">{{ titleKey | translate }}</h2>
      <div class="d-flex gap-2"><ng-content /></div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() titleKey = '';
}
