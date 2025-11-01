import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupsService } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-group-invites',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class=\"invites-container\">
      <header class=\"invites-header\">
        <h1>Group Invites</h1>
      </header>

      <div class=\"invites-content\">
        <div *ngIf=\"loading()\" class=\"loading\">Loading invites...</div>
        
        <div *ngIf=\"!loading() && invites().length === 0\" class=\"no-invites\">
          You have no group invites.
        </div>

        <div *ngIf=\"invites().length > 0\" class=\"invites-list\">
          <div *ngFor=\"let invite of invites()\" class=\"invite-card\">
            <div class=\"invite-info\">
              <h3>{{ invite.group.name }}</h3>
              <p>Invited by: {{ getInviterName(invite.inviter) }}</p>
              <p class=\"invite-date\">{{ formatDate(invite.createdAt) }}</p>
              <span class=\"status-badge\" [class]=\"'status-' + invite.status\">
                {{ invite.status | titlecase }}
              </span>
            </div>
            
            <div class=\"invite-actions\" *ngIf=\"invite.status === 'pending'\">
              <button (click)=\"viewInvite(invite)\" class=\"view-btn\">
                View Invite
              </button>
              <button (click)=\"rejectInvite(invite)\" class=\"reject-btn\">
                Maybe Later
              </button>
            </div>
            
            <div class=\"invite-actions\" *ngIf=\"invite.status === 'rejected'\">
              <button (click)=\"viewInvite(invite)\" class=\"view-btn\">
                View Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invites-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .invites-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .invites-header h1 {
      color: var(--text-primary);
      margin: 0;
    }

    .invites-content {
      background: var(--bg-secondary);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
    }

    .loading, .no-invites {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .invites-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .invite-card {
      background: var(--bg-tertiary);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .invite-info {
      flex: 1;
    }

    .invite-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.2rem;
    }

    .invite-info p {
      margin: 0.25rem 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .invite-date {
      font-size: 0.8rem !important;
      color: var(--text-muted) !important;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status-rejected {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .invite-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .view-btn, .reject-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .view-btn {
      background: #007bff;
      color: white;
    }

    .view-btn:hover {
      background: #0056b3;
    }

    .reject-btn {
      background: #6c757d;
      color: white;
    }

    .reject-btn:hover {
      background: #5a6268;
    }

    @media (max-width: 768px) {
      .invites-container {
        padding: 0.5rem;
      }

      .invites-content {
        padding: 1rem;
      }

      .invite-card {
        flex-direction: column;
        align-items: stretch;
      }

      .invite-actions {
        flex-direction: row;
        justify-content: flex-end;
      }
    }
  `]
})
export class GroupInvitesComponent implements OnInit {
  invites = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadInvites();
  }

  loadInvites() {
    this.loading.set(true);
    this.groupsService.getUserInvites().subscribe({
      next: (invites) => {
        this.invites.set(invites);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load invites');
        this.loading.set(false);
      }
    });
  }

  viewInvite(invite: any) {
    this.router.navigate(['/invite', invite.inviterId, invite.groupId]);
  }

  rejectInvite(invite: any) {
    this.groupsService.updateInviteStatus(invite.id, 'rejected').subscribe({
      next: () => {
        this.toastService.success('Invite marked as rejected');
        this.loadInvites();
      },
      error: () => {
        this.toastService.error('Failed to update invite');
      }
    });
  }

  getInviterName(inviter: any): string {
    if (inviter.firstName && inviter.lastName) {
      return `${inviter.firstName} ${inviter.lastName}`;
    }
    return inviter.firstName || inviter.lastName || inviter.email;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}