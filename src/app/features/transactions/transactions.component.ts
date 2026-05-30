import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'nav.transactions' | translate }}</p>`
})
export class TransactionsComponent {}
