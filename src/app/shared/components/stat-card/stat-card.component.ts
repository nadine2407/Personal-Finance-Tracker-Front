import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [TranslateModule, CurrencyFormatPipe],
  template: `
    <div class="card h-100 stat-card" [class]="'stat-card--' + colorClass">
      <div class="card-body d-flex flex-column justify-content-between" style="gap:12px">
        <div class="stat-card__label">{{ labelKey | translate }}</div>
        <div class="stat-card__value"
             [class.pos]="colorClass==='income' || colorClass==='savings'"
             [class.neg]="colorClass==='expense'">
          {{ value | currencyFormat }}
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() labelKey = '';
  @Input() value: number = 0;
  @Input() colorClass = '';
}
