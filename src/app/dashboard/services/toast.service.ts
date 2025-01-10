import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
@Injectable({providedIn: 'root'})
export class ToastService {

  public messageService = inject(MessageService)

  showToast(message: string,summary:string,severity:string) {
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }
}
