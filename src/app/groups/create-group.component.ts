import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService, CreateGroupData } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="create-group-container">
      <header class="create-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>

      <div class="create-form-section">
        <form (ngSubmit)="createGroup()" #createForm="ngForm" class="create-form">
          <div class="form-group">
            <label for="groupName">Group Name *</label>
            <input 
              type="text" 
              id="groupName" 
              name="groupName"
              [(ngModel)]="newGroup.name" 
              required
              maxlength="255"
              placeholder="Enter group name (e.g., Wednesday Wizards)"
            >
            <small class="help-text">Choose a descriptive name for your MTG Commander group</small>
          </div>

          <div class="form-group">
            <label for="groupPassword">Password (Optional)</label>
            <input 
              type="password" 
              id="groupPassword" 
              name="groupPassword"
              [(ngModel)]="newGroup.password"
              placeholder="Leave empty for public group"
            >
            <small class="help-text">Set a password to make this a private group</small>
          </div>



          <div *ngIf="createForm.valid" class="form-actions">
            <button type="submit" [disabled]="creating()" class="submit-btn">
              {{ creating() ? 'Creating Group...' : 'Create Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-group-container {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .create-header {
      margin-bottom: 2rem;
    }

    .back-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .create-form-section {
      background: var(--bg-secondary);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
    }

    .create-form {
      max-width: 100%;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid var(--border-color);
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .form-group input:focus {
      outline: none;
      border-color: #007bff;
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .error {
      color: #ff6b6b;
      background-color: var(--hover-bg);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0.75rem;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: block;
      margin-top: 2rem;
    }

    .submit-btn {
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 0.75rem 2rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 !important;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #218838;
    }

    .submit-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .create-group-container {
        padding: 0.5rem;
      }
      
      .create-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      
      .create-form-section {
        padding: 1.5rem;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .submit-btn {
        width: 100%;
      }
    }
  `]
})
export class CreateGroupComponent {
  newGroup: CreateGroupData = { name: '', password: '' };
  creating = signal(false);
  error = signal<string | null>(null);

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private toastService: ToastService
  ) {}

  createGroup() {
    this.creating.set(true);
    this.error.set(null);
    
    this.groupsService.createGroup(this.newGroup).subscribe({
      next: () => {
        this.creating.set(false);
        this.toastService.success('Group created successfully!');
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        this.creating.set(false);
        this.toastService.error(err.error?.message || 'Failed to create group');
      }
    });
  }

  goBack() {
    this.router.navigate(['/groups']);
  }
}