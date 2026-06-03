import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CategoriesStore } from './categories.store';
import { Category } from '../../data/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  store = inject(CategoriesStore);
  private fb = inject(FormBuilder);

  searchQuery = '';

  get filteredCategories(): Category[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.store.categories();
    return this.store.categories().filter(c => c.name.toLowerCase().includes(q));
  }

  showFormModal = signal(false);
  editingCat = signal<Category | null>(null);
  showConfirmModal = signal(false);
  deletingCat = signal<Category | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    icon: [''],
    color: ['#1a237e']
  });

  ngOnInit(): void {
    this.store.load();
  }

  openForm(category?: Category): void {
    this.editingCat.set(category ?? null);
    if (category) {
      this.form.patchValue({ name: category.name, icon: category.icon ?? '', color: category.color ?? '#1a237e' });
    } else {
      this.form.reset({ name: '', icon: '', color: '#1a237e' });
    }
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingCat.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) return;
    const { name, icon, color } = this.form.getRawValue();
    const request = { name: name!, icon: icon || null, color: color || null };
    const cat = this.editingCat();
    if (cat) {
      this.store.update(cat.id, request);
    } else {
      this.store.create(request);
    }
    this.closeModal();
  }

  confirmDelete(category: Category): void {
    this.deletingCat.set(category);
    this.showConfirmModal.set(true);
  }

  deleteConfirmed(): void {
    const cat = this.deletingCat();
    if (cat) this.store.delete(cat.id);
    this.showConfirmModal.set(false);
    this.deletingCat.set(null);
  }
}
