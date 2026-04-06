import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toasts$ = this.toastSubject.asObservable();
  private toastId = 0;

  private show(type: Toast['type'], title: string, message: string): void {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      title,
      message
    };
    console.log('🔔 Toast émis:', toast);
    this.toastSubject.next(toast);
  }

  success(message: string, title: string = 'Succès'): void {
    this.show('success', title, message);
  }

  error(message: string, title: string = 'Erreur'): void {
    this.show('error', title, message);
  }

  warning(message: string, title: string = 'Attention'): void {
    this.show('warning', title, message);
  }

  info(message: string, title: string = 'Information'): void {
    this.show('info', title, message);
  }
}
