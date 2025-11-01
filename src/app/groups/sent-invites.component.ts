import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupsService } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-sent-invites',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class=\"sent-invites-container\">
      <header class=\"sent-invites-header\">
        <h1>Sent Invites</h1>
      </header>

      <div class=\"sent-invites-content\">
        <div *ngIf=\"loading()\" class=\"loading\">Loading sent invites...</div>
        
        <div *ngIf=\"!loading() && sentInvites().length === 0\" class=\"no-invites\">
          You haven't sent any group invites.
        </div>

        <div *ngIf=\"sentInvites().length > 0\" class=\"invites-list\">
          <div *ngFor=\"let invite of sentInvites()\" class=\"invite-card\">
            <div class=\"invite-info\">
              <h3>{{ invite.group.name }}</h3>
              <p>Sent to: {{ getInviteeName(invite.invitee) }}</p>
              <p class=\"invite-date\">{{ formatDate(invite.createdAt) }}</p>
              <span class=\"status-badge\" [class]=\"'status-' + invite.status\">
                {{ invite.status | titlecase }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sent-invites-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .sent-invites-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .sent-invites-header h1 {
      color: var(--text-primary);
      margin: 0;
    }

    .sent-invites-content {
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

    .status-accepted {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .status-rejected {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @media (max-width: 768px) {
      .sent-invites-container {
        padding: 0.5rem;
      }

      .sent-invites-content {
        padding: 1rem;
      }
    }
  `]
})
export class SentInvitesComponent implements OnInit {
  sentInvites = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadSentInvites();
  }

  loadSentInvites() {
    this.loading.set(true);
    this.groupsService.getSentInvites().subscribe({
      next: (invites) => {
        this.sentInvites.set(invites);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load sent invites');
        this.loading.set(false);
      }
    });
  }

  getInviteeName(invitee: any): string {
    if (invitee.firstName && invitee.lastName) {
      return `${invitee.firstName} ${invitee.lastName}`;
    }
    return invitee.firstName || invitee.lastName || invitee.email;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}