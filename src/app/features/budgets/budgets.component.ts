import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { BudgetsStore } from './budgets.store';
import { CategoriesService } from '../categories/categories.service';
import { BudgetStatusItem } from '../../shared/models/budget.model';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    DecimalPipe,
    PageHeaderComponent,
    EmptyStateComponent,
    StatCardComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent implements OnInit {
  store = inject(BudgetsStore);
  private categoriesService = inject(CategoriesService);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: this.translate.instant(`dashboard.months.${i + 1}`)
  }));

  readonly years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  showFormModal = signal(false);
  editingItem = signal<BudgetStatusItem | null>(null);
  showConfirmModal = signal(false);
  deletingItem = signal<BudgetStatusItem | null>(null);
  categories = signal<Category[]>([]);

  form = this.fb.group({
    categoryId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.store.load();
  }

  openForm(item?: BudgetStatusItem): void {
    this.categoriesService.getAll().subscribe(cats => {
      this.categories.set(cats);
      this.editingItem.set(item ?? null);
      if (item) {
        this.form.patchValue({ categoryId: item.categoryId, amount: item.budgetAmount });
      } else {
        this.form.reset({ categoryId: null, amount: null });
      }
      this.showFormModal.set(true);
    });
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingItem.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) return;
    const { categoryId, amount } = this.form.getRawValue();
    const request = {
      categoryId: categoryId!,
      amount: amount!,
      month: this.store.currentMonth(),
      year: this.store.currentYear()
    };
    const item = this.editingItem();
    if (item) {
      this.store.update(item.id, request);
    } else {
      this.store.create(request);
    }
    this.closeModal();
  }

  confirmDelete(item: BudgetStatusItem): void {
    this.deletingItem.set(item);
    this.showConfirmModal.set(true);
  }

  deleteConfirmed(): void {
    const item = this.deletingItem();
    if (item) this.store.delete(item.id);
    this.showConfirmModal.set(false);
    this.deletingItem.set(null);
  }

  duplicatePrevMonth(): void {
    const month = this.store.currentMonth();
    const year = this.store.currentYear();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    this.store.duplicate(prevMonth, prevYear);
  }
}
