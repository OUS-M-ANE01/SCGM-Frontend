import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toasts; track toast.id) {
        <div 
          class="min-w-80 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 animate-slide-in"
          [class.border-l-4]="true"
          [class.border-green-500]="toast.type === 'success'"
          [class.border-red-500]="toast.type === 'error'"
          [class.border-yellow-500]="toast.type === 'warning'"
          [class.border-blue-500]="toast.type === 'info'"
        >
          <div class="p-4 flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              @if (toast.type === 'success') {
                <svg class="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              @if (toast.type === 'error') {
                <svg class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              @if (toast.type === 'warning') {
                <svg class="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              @if (toast.type === 'info') {
                <svg class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>
            
            <!-- Content -->
            <div class="ml-3 flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ toast.title }}</p>
              <p class="mt-1 text-sm text-gray-600">{{ toast.message }}</p>
            </div>
            
            <!-- Close button -->
            <button 
              (click)="removeToast(toast.id)"
              class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Progress bar -->
          <div class="h-1 bg-gray-200">
            <div 
              class="h-full transition-all duration-[3000ms] ease-linear"
              [class.bg-green-500]="toast.type === 'success'"
              [class.bg-red-500]="toast.type === 'error'"
              [class.bg-yellow-500]="toast.type === 'warning'"
              [class.bg-blue-500]="toast.type === 'info'"
              [style.width.%]="0"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent implements OnInit {
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  toasts: Toast[] = [];

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toast => {
      // Utiliser setTimeout pour éviter ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.toasts.push(toast);
        this.cdr.detectChanges();
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          this.removeToast(toast.id);
        }, 3000);
      }, 0);
    });
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }
}
