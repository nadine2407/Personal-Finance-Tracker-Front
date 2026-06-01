import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const router = inject(Router);
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      } else if (err.status === 400) {
        const message = err.error?.message || err.error?.error || 'Données invalides';
        notification.error(message);
      } else if (err.status === 404) {
        notification.error('common.error_load');
      } else if (err.status >= 500) {
        notification.error('common.error_load');
      }
      return throwError(() => err);
    })
  );
};
