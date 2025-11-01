import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position: fixed; top: 1rem; right: 1rem; z-index: 9999; max-width: 400px;">
      <div 
        *ngFor="let toast of getToasts()" 
        [style]="getToastStyle(toast.type)"
        (click)="toastService.remove(toast.id)"
      >
        <span [style]="getIconStyle(toast.type)">{{ getIcon(toast.type) }}</span>
        {{ toast.message }}
        <span style="float: right; margin-left: 10px; font-weight: bold; cursor: pointer;">×</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      pointer-events: auto;
    }

    .toast-success {
      border-left-color: #28a745;
    }

    .toast-error {
      border-left-color: #dc3545;
    }

    .toast-warning {
      border-left-color: #ffc107;
    }

    .toast-info {
      border-left-color: #17a2b8;
    }

    .toast-content {
      display: flex;
      align-items: center;
      padding: 1rem;
      gap: 0.75rem;
    }

    .toast-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .toast-success .toast-icon {
      color: #28a745;
    }

    .toast-error .toast-icon {
      color: #dc3545;
    }

    .toast-warning .toast-icon {
      color: #ffc107;
    }

    .toast-info .toast-icon {
      color: #17a2b8;
    }

    .toast-message {
      flex: 1;
      color: #333;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .toast-close:hover {
      background-color: #f0f0f0;
      color: #666;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .toast-container {
        top: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
        max-width: none;
      }
      
      .toast-content {
        padding: 0.75rem;
      }
      
      .toast-message {
        font-size: 0.85rem;
      }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  getToasts() {
    return this.toastService.getToasts()();
  }

  getToastStyle(type: string): string {
    const baseStyle = 'background: var(--bg-tertiary); color: var(--text-primary); border-radius: 8px; box-shadow: 0 4px 12px var(--shadow); margin-bottom: 0.5rem; padding: 1rem; cursor: pointer; display: flex; align-items: center; animation: slideIn 0.3s ease-out;';
    
    switch (type) {
      case 'success': return baseStyle + ' border-left: 4px solid #28a745;';
      case 'error': return baseStyle + ' border-left: 4px solid #dc3545;';
      case 'warning': return baseStyle + ' border-left: 4px solid #ffc107;';
      case 'info': return baseStyle + ' border-left: 4px solid #17a2b8;';
      default: return baseStyle + ' border-left: 4px solid #17a2b8;';
    }
  }

  getIconStyle(type: string): string {
    const baseStyle = 'margin-right: 0.5rem; font-weight: bold;';
    
    switch (type) {
      case 'success': return baseStyle + ' color: #28a745;';
      case 'error': return baseStyle + ' color: #dc3545;';
      case 'warning': return baseStyle + ' color: #ffc107;';
      case 'info': return baseStyle + ' color: #17a2b8;';
      default: return baseStyle + ' color: #17a2b8;';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
}