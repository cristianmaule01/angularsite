import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-group-invite',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="invite-container">
      <div class="invite-card">
        <div *ngIf="loading()" class="loading">
          Loading invitation details...
        </div>
        
        <div *ngIf="error()" class="error">
          {{ error() }}
        </div>
        
        <div *ngIf="inviteInfo() && !loading() && !error()" class="invite-content">
          <div class="invite-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M22 11l-3-3m0 0l-3 3m3-3v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <h2>Group Invitation</h2>
          
          <div class="invite-message">
            <p>
              <strong>{{ getReferrerName() }}</strong> has invited you to join their Commander group 
              <strong>"{{ inviteInfo()?.group.name }}"</strong>
            </p>
          </div>
          
          <div *ngIf="inviteInfo()?.alreadyMember" class="already-member">
            <p>You are already a member of this group!</p>
            <button (click)="goToGroup()" class="view-group-btn">
              View Group
            </button>
          </div>
          
          <div *ngIf="!inviteInfo()?.alreadyMember" class="invite-actions">
            <div *ngIf="inviteInfo()?.group.requiresPassword" class="password-section">
              <p class="password-prompt">This group requires a password to join. The person providing the link will provide you the password.</p>
              <input 
                type="password" 
                [(ngModel)]="password" 
                placeholder="Enter group password" 
                class="password-input"
                [disabled]="accepting()"
              >
            </div>
            <div class="action-buttons">
              <button (click)="acceptInvite()" [disabled]="accepting() || (inviteInfo()?.group.requiresPassword && !password)" class="join-btn">
                {{ accepting() ? 'Joining...' : 'Join Group' }}
              </button>
              <button (click)="goToGroups()" class="cancel-btn">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invite-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      padding: 2rem;
    }

    .invite-card {
      background: var(--bg-secondary);
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--shadow);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .invite-icon {
      color: #007bff;
      margin-bottom: 1.5rem;
    }

    .invite-icon svg {
      width: 64px;
      height: 64px;
    }

    h2 {
      color: var(--text-primary);
      margin: 0 0 2rem 0;
      font-size: 1.8rem;
    }

    .invite-message {
      margin-bottom: 2rem;
    }

    .invite-message p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      line-height: 1.5;
      margin: 0;
    }

    .already-member {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .already-member p {
      margin: 0 0 1rem 0;
    }

    .invite-actions {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .password-section {
      text-align: center;
    }

    .password-prompt {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
      line-height: 1.4;
    }

    .password-input {
      width: 100%;
      max-width: 300px;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-size: 1rem;
    }

    .password-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .join-btn, .cancel-btn, .view-group-btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .join-btn, .view-group-btn {
      background: #007bff;
      color: white;
    }

    .join-btn:hover:not(:disabled), .view-group-btn:hover {
      background: #0056b3;
    }

    .join-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .cancel-btn {
      background: #6c757d;
      color: white;
    }

    .cancel-btn:hover {
      background: #5a6268;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .error {
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .invite-container {
        padding: 1rem;
      }

      .invite-card {
        padding: 2rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .join-btn, .cancel-btn {
        width: 100%;
      }
    }
  `]
})
export class GroupInviteComponent implements OnInit {
  inviteInfo = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  accepting = signal(false);
  password = '';
  
  private referrerId = '';
  private groupId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.referrerId = params['referrerId'];
      this.groupId = params['groupId'];
      this.loadInviteInfo();
    });
  }

  loadInviteInfo() {
    this.loading.set(true);
    this.error.set(null);

    this.groupsService.getInviteInfo(this.referrerId, this.groupId).subscribe({
      next: (info) => {
        this.inviteInfo.set(info);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Invalid or expired invitation link');
        this.loading.set(false);
      }
    });
  }

  acceptInvite() {
    this.accepting.set(true);

    // Check if this is from a direct invite (has invite ID in URL params)
    const inviteId = this.route.snapshot.queryParams['inviteId'];
    
    if (inviteId) {
      // Accept through invite system
      this.groupsService.updateInviteStatus(inviteId, 'accepted').subscribe({
        next: () => {
          this.toastService.success('Successfully joined the group!');
          this.router.navigate(['/groups']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to join group');
          this.accepting.set(false);
        }
      });
    } else {
      // Accept through URL invite
      this.groupsService.acceptInvite(this.referrerId, this.groupId, this.password).subscribe({
        next: (result) => {
          this.toastService.success('Successfully joined the group!');
          this.router.navigate(['/groups']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to join group');
          this.accepting.set(false);
        }
      });
    }
  }

  goToGroup() {
    this.router.navigate(['/groups', this.groupId]);
  }

  goToGroups() {
    const inviteId = this.route.snapshot.queryParams['inviteId'];
    
    if (inviteId) {
      // Mark invite as rejected before navigating
      this.groupsService.updateInviteStatus(inviteId, 'rejected').subscribe({
        next: () => {
          this.router.navigate(['/groups']);
        },
        error: () => {
          this.router.navigate(['/groups']);
        }
      });
    } else {
      this.router.navigate(['/groups']);
    }
  }

  getReferrerName(): string {
    const referrer = this.inviteInfo()?.referrer;
    if (!referrer) return '';
    
    if (referrer.firstName && referrer.lastName) {
      return `${referrer.firstName} ${referrer.lastName}`;
    }
    return referrer.firstName || referrer.lastName || referrer.email;
  }
}