import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [TranslateModule, CurrencyFormatPipe],
  template: `
    <div class="card h-100">
      <div class="card-body">
        <div class="text-muted small mb-1">{{ labelKey | translate }}</div>
        <div class="fs-4 fw-bold" [class.text-success]="colorClass==='income' || colorClass==='savings'"
             [class.text-danger]="colorClass==='expense'">
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
