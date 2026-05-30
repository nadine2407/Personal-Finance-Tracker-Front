import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'nav.categories' | translate }}</p>`
})
export class CategoriesComponent {}
