import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" routerLink="/dashboard">
          <i class="bi bi-wallet2 me-2"></i>Finance Tracker
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1"></i>{{ 'nav.dashboard' | translate }}
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/transactions" routerLinkActive="active">
                <i class="bi bi-arrow-left-right me-1"></i>{{ 'nav.transactions' | translate }}
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/accounts" routerLinkActive="active">
                <i class="bi bi-bank me-1"></i>{{ 'nav.accounts' | translate }}
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/budgets" routerLinkActive="active">
                <i class="bi bi-pie-chart me-1"></i>{{ 'nav.budgets' | translate }}
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/goals" routerLinkActive="active">
                <i class="bi bi-trophy me-1"></i>{{ 'nav.goals' | translate }}
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/categories" routerLinkActive="active">
                <i class="bi bi-tags me-1"></i>{{ 'nav.categories' | translate }}
              </a>
            </li>
          </ul>

          <button class="btn btn-outline-light btn-sm" (click)="logout()">
            <i class="bi bi-box-arrow-right me-1"></i>{{ 'nav.logout' | translate }}
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
