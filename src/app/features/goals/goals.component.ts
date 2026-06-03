import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { GoalsStore } from './goals.store';
import { AccountsStore } from '../accounts/accounts.store';
import { Goal } from '../../shared/models/goal.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    DecimalPipe,
    RouterLink,
    PageHeaderComponent,
    EmptyStateComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  store = inject(GoalsStore);
  accountsStore = inject(AccountsStore);
  private fb = inject(FormBuilder);

  // Formulaire création/édition
  showFormModal = signal(false);
  editingGoal = signal<Goal | null>(null);

  // Dépôt (ajout delta)
  showDepositModal = signal(false);
  depositingGoal = signal<Goal | null>(null);
  depositAmount = signal<number>(0);
  depositMax = signal<number>(0);

  // Retrait (soustraction delta)
  showWithdrawModal = signal(false);
  withdrawingGoal = signal<Goal | null>(null);
  withdrawAmount = signal<number>(0);

  // Suppression
  showConfirmModal = signal(false);
  deletingGoal = signal<Goal | null>(null);

  private readonly priorityColors = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'];

  form = this.fb.group({
    linkedAccountId: [null as number | null, Validators.required],
    name:            ['', Validators.required],
    targetAmount:    [null as number | null, [Validators.required, Validators.min(0.01)]],
    allocatedAmount: [0 as number | null, [Validators.required, Validators.min(0)]],
    deadline:        [''],
    description:     ['']
  });

  ngOnInit(): void {
    this.store.load();
    this.accountsStore.load();
  }

  // ── Form ────────────────────────────────────────────────────────────────

  openForm(accountId?: number, goal?: Goal): void {
    this.editingGoal.set(goal ?? null);
    if (goal) {
      this.form.patchValue({
        linkedAccountId: goal.linkedAccountId,
        name: goal.name,
        targetAmount: goal.targetAmount,
        allocatedAmount: goal.allocatedAmount,
        deadline: goal.deadline ?? '',
        description: goal.description ?? ''
      });
      this.form.get('linkedAccountId')?.disable();
      this.form.get('allocatedAmount')?.disable();
    } else {
      this.form.reset({ linkedAccountId: accountId ?? null, name: '', targetAmount: null, allocatedAmount: 0, deadline: '', description: '' });
      this.form.get('linkedAccountId')?.enable();
      this.form.get('allocatedAmount')?.enable();
    }
    this.showFormModal.set(true);
  }

  closeForm(): void {
    this.showFormModal.set(false);
    this.editingGoal.set(null);
    this.form.get('linkedAccountId')?.enable();
    this.form.get('allocatedAmount')?.enable();
  }

  submitForm(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const req = { name: raw.name!, targetAmount: raw.targetAmount!, deadline: raw.deadline || null, description: raw.description || null, linkedAccountId: raw.linkedAccountId ?? null, allocatedAmount: raw.allocatedAmount ?? 0 };
    const goal = this.editingGoal();
    if (goal) { this.store.update(goal.id, req); } else { this.store.create(req); }
    this.closeForm();
  }

  // ── Dépôt (delta) ────────────────────────────────────────────────────────

  openDeposit(goal: Goal): void {
    const group = this.store.goalsByAccount().find(g => g.account.id === goal.linkedAccountId);
    this.depositingGoal.set(goal);
    this.depositAmount.set(0);
    this.depositMax.set(group ? Math.max(0, group.unallocated) : 0);
    this.showDepositModal.set(true);
  }

  submitDeposit(): void {
    const goal = this.depositingGoal();
    if (!goal || this.depositAmount() <= 0) return;
    this.store.allocate(goal.id, { allocatedAmount: (goal.allocatedAmount ?? 0) + this.depositAmount() });
    this.showDepositModal.set(false);
    this.depositingGoal.set(null);
  }

  // ── Retrait (delta) ──────────────────────────────────────────────────────

  openWithdraw(goal: Goal): void {
    this.withdrawingGoal.set(goal);
    this.withdrawAmount.set(0);
    this.showWithdrawModal.set(true);
  }

  submitWithdraw(): void {
    const goal = this.withdrawingGoal();
    if (!goal || this.withdrawAmount() <= 0) return;
    const newTotal = Math.max(0, (goal.allocatedAmount ?? 0) - this.withdrawAmount());
    this.store.allocate(goal.id, { allocatedAmount: newTotal });
    this.showWithdrawModal.set(false);
    this.withdrawingGoal.set(null);
  }

  // ── Priority ─────────────────────────────────────────────────────────────

  moveUp(goal: Goal): void   { this.store.movePriority(goal.id, 'up'); }
  moveDown(goal: Goal): void { this.store.movePriority(goal.id, 'down'); }

  // ── Delete ───────────────────────────────────────────────────────────────

  confirmDelete(goal: Goal): void { this.deletingGoal.set(goal); this.showConfirmModal.set(true); }

  deleteConfirmed(): void {
    const goal = this.deletingGoal();
    if (goal) this.store.delete(goal.id);
    this.showConfirmModal.set(false);
    this.deletingGoal.set(null);
  }

  // ── Styles & helpers ─────────────────────────────────────────────────────

  priorityColor(idx: number): string {
    return this.priorityColors[Math.min(idx, this.priorityColors.length - 1)];
  }

  goalItemStyle(idx: number): string {
    const c = this.priorityColor(idx);
    return `background: #152035; border: 1px solid rgba(255,255,255,0.07); border-left: 4px solid ${c}`;
  }

  accountHeaderStyle(color: string | null): string {
    const c = color ?? '#6e8fff';
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `background: linear-gradient(135deg, rgba(${r},${g},${b},0.18) 0%, rgba(${r},${g},${b},0.06) 100%); border-left: 4px solid ${c}; border-bottom: 1px solid rgba(255,255,255,0.07)`;
  }

  progressBarColor(pct: number): string {
    if (pct >= 100) return '#22c55e';
    if (pct >= 60)  return '#3b82f6';
    if (pct >= 30)  return '#f97316';
    return '#ef4444';
  }

  daysRemaining(deadline: string | null): number | null {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  }

  withdrawPreview(): number {
    return Math.max(0, (this.withdrawingGoal()?.allocatedAmount ?? 0) - this.withdrawAmount());
  }

  savingsAccounts() { return this.accountsStore.accounts().filter(a => a.type === 'SAVINGS'); }
  hasAnySavingsAccount(): boolean { return this.savingsAccounts().length > 0; }
}
