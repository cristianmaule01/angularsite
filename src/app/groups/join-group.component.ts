import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService, Group } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-join-group',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="join-group-container">
      <header class="join-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
        <h1>Join Group</h1>
      </header>

      <div *ngIf="loading()" class="loading">Loading group details...</div>

      <div *ngIf="group()" class="join-form-section">
        <div class="group-info">
          <h2>{{ group()?.name }}</h2>
          <p>Created by: {{ getCreatorName(group()?.creator) }}</p>
          <p class="created-date">{{ group()?.createdAt ? formatDate(group()!.createdAt) : 'Unknown date' }}</p>
        </div>

        <form (ngSubmit)="joinGroup()" #joinForm="ngForm" class="join-form">
          <div *ngIf="requiresPassword()" class="form-group">
            <label for="password">Group Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="password"
              placeholder="Enter group password"
              required
            >
            <small class="help-text">This group requires a password to join</small>
          </div>
          
          <div *ngIf="!requiresPassword()" class="info-message">
            <p>This is a public group - no password required!</p>
          </div>



          <div class="form-actions">
            <button type="button" (click)="goBack()" class="cancel-btn">Cancel</button>
            <button type="submit" [disabled]="joining()" class="submit-btn">
              {{ joining() ? 'Joining Group...' : 'Join Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .join-group-container {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .join-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .back-btn {
      padding: 0.5rem 1rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .join-header h1 {
      margin: 0;
      color: #333;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .error {
      color: #dc3545;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .join-form-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .group-info {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .group-info h2 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .group-info p {
      margin: 0.5rem 0;
      color: #666;
    }

    .created-date {
      font-size: 0.9rem;
      color: #999 !important;
    }

    .join-form {
      max-width: 100%;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #007bff;
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .info-message {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .info-message p {
      margin: 0;
      color: #0c5460;
      font-weight: 500;
    }

    .form-actions {
      display: block;
      margin-top: 2rem;
    }

    .cancel-btn {
      padding: 0.75rem 1.5rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .cancel-btn:hover {
      background-color: #5a6268;
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
      .join-group-container {
        padding: 0.5rem;
      }
      
      .join-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      
      .join-form-section {
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
export class JoinGroupComponent implements OnInit {
  groupId: string = '';
  password: string = '';
  group = signal<Group | null>(null);
  loading = signal(false);
  joining = signal(false);
  error = signal<string | null>(null);
  joinError = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadGroupDetails();
    }
  }

  loadGroupDetails() {
    this.loading.set(true);
    this.error.set(null);

    // We need to search for the group to get its details
    this.groupsService.searchGroups('').subscribe({
      next: (groups) => {
        const foundGroup = groups.find(g => g.id === this.groupId);
        if (foundGroup) {
          this.group.set(foundGroup);
        } else {
          this.toastService.error('Group not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error('Failed to load group details');
        this.loading.set(false);
      }
    });
  }

  joinGroup() {
    this.joining.set(true);
    this.joinError.set(null);

    const joinData = {
      groupId: this.groupId,
      password: this.password.trim() || undefined
    };

    this.groupsService.joinGroup(joinData).subscribe({
      next: () => {
        this.joining.set(false);
        this.toastService.success('Successfully joined group!');
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        this.joining.set(false);
        this.toastService.error(err.error?.message || 'Failed to join group');
      }
    });
  }

  goBack() {
    this.router.navigate(['/groups']);
  }

  getCreatorName(creator: any): string {
    if (!creator) return 'Unknown';
    if (creator.firstName && creator.lastName) {
      return `${creator.firstName} ${creator.lastName}`;
    }
    return creator.firstName || creator.lastName || creator.email;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  requiresPassword(): boolean {
    return !!(this.group()?.passwordHash);
  }
}