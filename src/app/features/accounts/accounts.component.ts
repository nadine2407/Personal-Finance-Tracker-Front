import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { AccountsStore } from './accounts.store';
import { Account, AccountType } from '../../shared/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatCardComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit {
  store = inject(AccountsStore);
  private fb = inject(FormBuilder);

  showFormModal = signal(false);
  editingAccount = signal<Account | null>(null);
  showConfirmModal = signal(false);
  deletingAccount = signal<Account | null>(null);

  readonly accountTypes: AccountType[] = ['CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'CASH'];

  readonly typeDefaults: Record<AccountType, { icon: string; color: string }> = {
    CHECKING:   { icon: '🏦', color: '#4f8ef7' },
    SAVINGS:    { icon: '💰', color: '#22c55e' },
    CREDIT:     { icon: '💳', color: '#f43f5e' },
    INVESTMENT: { icon: '📈', color: '#f59e0b' },
    CASH:       { icon: '💵', color: '#94a3b8' }
  };

  form = this.fb.group({
    name:           ['', [Validators.required, Validators.maxLength(100)]],
    type:           ['CHECKING' as AccountType, Validators.required],
    initialBalance: [0 as number | null, [Validators.required, Validators.min(0)]],
    color:          ['#4f8ef7'],
    icon:           ['🏦']
  });

  ngOnInit(): void {
    this.store.load();

    this.form.get('type')?.valueChanges.subscribe(type => {
      if (!type) return;
      const defaults = this.typeDefaults[type as AccountType];
      if (!this.form.get('color')?.dirty) this.form.get('color')?.setValue(defaults.color, { emitEvent: false });
      if (!this.form.get('icon')?.dirty)  this.form.get('icon')?.setValue(defaults.icon, { emitEvent: false });
    });
  }

  openForm(account?: Account): void {
    this.editingAccount.set(account ?? null);
    if (account) {
      this.form.patchValue({
        name: account.name,
        type: account.type,
        initialBalance: account.initialBalance,
        color: account.color ?? '#4f8ef7',
        icon: account.icon ?? '🏦'
      });
    } else {
      this.form.reset({ name: '', type: 'CHECKING', initialBalance: 0, color: '#4f8ef7', icon: '🏦' });
    }
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingAccount.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) return;
    const { name, type, initialBalance, color, icon } = this.form.getRawValue();
    const request = {
      name: name!,
      type: type! as AccountType,
      initialBalance: initialBalance ?? 0,
      color: color || null,
      icon: icon || null
    };
    const account = this.editingAccount();
    if (account) {
      this.store.update(account.id, request);
    } else {
      this.store.create(request);
    }
    this.closeModal();
  }

  confirmDelete(account: Account): void {
    this.deletingAccount.set(account);
    this.showConfirmModal.set(true);
  }

  deleteConfirmed(): void {
    const account = this.deletingAccount();
    if (account) this.store.delete(account.id);
    this.showConfirmModal.set(false);
    this.deletingAccount.set(null);
  }

  typeIcon(account: Account): string {
    const icons: Record<string, string> = {
      CHECKING: '🏦', SAVINGS: '💰', CREDIT: '💳', INVESTMENT: '📈', CASH: '💵'
    };
    return account.icon ?? icons[account.type] ?? '💼';
  }
}
