import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'nav.budgets' | translate }}</p>`
})
export class BudgetsComponent {}
