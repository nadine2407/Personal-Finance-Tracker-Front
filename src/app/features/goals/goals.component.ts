import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p>{{ 'nav.goals' | translate }}</p>`
})
export class GoalsComponent {}
