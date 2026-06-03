import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private translate = inject(TranslateService);

  success(messageKey: string): void {
    const message = this.translate.instant(messageKey);
    Swal.fire({ icon: 'success', title: message, toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
  }

  error(messageKey: string): void {
    const message = this.translate.instant(messageKey);
    Swal.fire({ icon: 'error', title: message, toast: true, position: 'bottom-end', showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }

  info(messageKey: string): void {
    const message = this.translate.instant(messageKey);
    Swal.fire({ icon: 'info', title: message, toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
  }
}
