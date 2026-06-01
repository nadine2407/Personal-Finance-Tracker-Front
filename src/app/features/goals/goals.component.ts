import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { GoalsStore } from './goals.store';
import { Goal } from '../../shared/models/goal.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    DecimalPipe,
    PageHeaderComponent,
    EmptyStateComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  store = inject(GoalsStore);
  private fb = inject(FormBuilder);

  showFormModal = signal(false);
  editingGoal = signal<Goal | null>(null);
  showConfirmModal = signal(false);
  deletingGoal = signal<Goal | null>(null);
  showDepositModal = signal(false);
  depositingGoal = signal<Goal | null>(null);
  depositAmount = signal(0);
  showWithdrawModal = signal(false);
  withdrawingGoal = signal<Goal | null>(null);
  withdrawAmount = signal(0);

  form = this.fb.group({
    name: ['', Validators.required],
    targetAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    deadline: [''],
    description: ['']
  });

  ngOnInit(): void {
    this.store.load();
  }

  openForm(goal?: Goal): void {
    this.editingGoal.set(goal ?? null);
    if (goal) {
      this.form.patchValue({
        name: goal.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline ?? '',
        description: goal.description ?? ''
      });
    } else {
      this.form.reset({ name: '', targetAmount: null, deadline: '', description: '' });
    }
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingGoal.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) return;
    const { name, targetAmount, deadline, description } = this.form.getRawValue();
    const request = {
      name: name!,
      targetAmount: targetAmount!,
      deadline: deadline || null,
      description: description || null
    };
    const goal = this.editingGoal();
    if (goal) {
      this.store.update(goal.id, request);
    } else {
      this.store.create(request);
    }
    this.closeModal();
  }

  openDeposit(goal: Goal): void {
    this.depositingGoal.set(goal);
    this.depositAmount.set(0);
    this.showDepositModal.set(true);
  }

  submitDeposit(): void {
    const goal = this.depositingGoal();
    if (goal && this.depositAmount() > 0) {
      this.store.deposit(goal.id, { amount: this.depositAmount() });
    }
    this.showDepositModal.set(false);
    this.depositingGoal.set(null);
  }

  openWithdraw(goal: Goal): void {
    this.withdrawingGoal.set(goal);
    this.withdrawAmount.set(0);
    this.showWithdrawModal.set(true);
  }

  submitWithdraw(): void {
    const goal = this.withdrawingGoal();
    if (goal && this.withdrawAmount() > 0) {
      this.store.withdraw(goal.id, { amount: this.withdrawAmount() });
    }
    this.showWithdrawModal.set(false);
    this.withdrawingGoal.set(null);
  }

  confirmDelete(goal: Goal): void {
    this.deletingGoal.set(goal);
    this.showConfirmModal.set(true);
  }

  deleteConfirmed(): void {
    const goal = this.deletingGoal();
    if (goal) this.store.delete(goal.id);
    this.showConfirmModal.set(false);
    this.deletingGoal.set(null);
  }

  daysRemaining(deadline: string | null): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
