import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmationService.getVisibility()()" class="modal-overlay" (click)="confirmationService.handleCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()" [class]="'modal-' + confirmationService.getData()()?.type">
        <div class="modal-header">
          <h3>{{ confirmationService.getData()()?.title }}</h3>
        </div>
        
        <div class="modal-body">
          <p>{{ confirmationService.getData()()?.message }}</p>
        </div>
        
        <div class="modal-actions">
          <button (click)="confirmationService.handleCancel()" class="cancel-btn">
            {{ confirmationService.getData()()?.cancelText }}
          </button>
          <button (click)="confirmationService.handleConfirm()" class="confirm-btn" [class]="'btn-' + confirmationService.getData()()?.type">
            {{ confirmationService.getData()()?.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: var(--bg-secondary);
      border-radius: 8px;
      box-shadow: 0 10px 25px var(--shadow);
      max-width: 400px;
      width: 90%;
      animation: slideIn 0.2s ease-out;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .modal-danger .modal-header h3 {
      color: #dc3545;
    }

    .modal-warning .modal-header h3 {
      color: #ffc107;
    }

    .modal-info .modal-header h3 {
      color: #17a2b8;
    }

    .modal-body {
      padding: 1rem 1.5rem;
    }

    .modal-body p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .modal-actions {
      padding: 0 1.5rem 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .cancel-btn, .confirm-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .cancel-btn {
      background-color: #6c757d;
      color: white;
    }

    .cancel-btn:hover {
      background-color: #5a6268;
    }

    .confirm-btn.btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .confirm-btn.btn-danger:hover {
      background-color: #c82333;
    }

    .confirm-btn.btn-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .confirm-btn.btn-warning:hover {
      background-color: #e0a800;
    }

    .confirm-btn.btn-info {
      background-color: #17a2b8;
      color: white;
    }

    .confirm-btn.btn-info:hover {
      background-color: #138496;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 480px) {
      .modal-content {
        width: 95%;
        margin: 1rem;
      }
      
      .modal-actions {
        flex-direction: column;
      }
      
      .cancel-btn, .confirm-btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationModalComponent {
  constructor(public confirmationService: ConfirmationService) {}
}