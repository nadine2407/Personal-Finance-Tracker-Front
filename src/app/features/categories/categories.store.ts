import { Injectable, inject, signal, computed } from '@angular/core';
import { CategoriesService } from './categories.service';
import { NotificationService } from '../../core/services/notification.service';
import { Category, CategoryRequest } from '../../shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private service = inject(CategoriesService);
  private notification = inject(NotificationService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => { this.categories.set(data); this.loading.set(false); },
      error: () => { this.error.set('common.error_load'); this.loading.set(false); }
    });
  }

  create(request: CategoryRequest): void {
    this.service.create(request).subscribe({
      next: created => {
        this.categories.update(list => [...list, created]);
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  update(id: number, request: CategoryRequest): void {
    this.service.update(id, request).subscribe({
      next: updated => {
        this.categories.update(list => list.map(c => c.id === id ? updated : c));
        this.notification.success('common.success_save');
      },
      error: () => this.notification.error('common.error_save')
    });
  }

  delete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.categories.update(list => list.filter(c => c.id !== id));
        this.notification.success('common.success_delete');
      },
      error: () => this.notification.error('common.error_delete')
    });
  }
}