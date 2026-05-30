import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'nav.dashboard' | translate }}</p>`
})
export class DashboardComponent {}
