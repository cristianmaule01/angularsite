import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService, GroupMember } from './groups.service';
import { NavigationComponent } from '../shared/navigation.component';
import { ToastService } from '../shared/toast.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmationService } from '../shared/confirmation.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="group-detail-container">
      <header class="group-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>
      
      <div class="group-title">
        <h1>{{ group()?.name || 'Group' }}</h1>
      </div>

      <div *ngIf="loading()" class="loading">Loading members...</div>

      <div *ngIf="members().length > 0" class="members-section">
        <p class="hint-text">💡 Click on a member's name to view their decks</p>
        <div class="members-grid">
          <div *ngFor="let member of members()" class="member-card">
            <div class="member-info">
              <h3 class="member-name" (click)="viewUserDecks(member.user.id, getMemberName(member.user))">{{ getMemberName(member.user) }}</h3>
              <p class="member-email">{{ member.user.email }}</p>
              <div class="role-section">
                <span class="role-label">Role:</span>
                <select *ngIf="canChangeRole(member.user.id)" 
                        [value]="member.role" 
                        (change)="updateMemberRole(member.user.id, $event)" 
                        class="role-select">
                  <option value="player">Player</option>
                  <option value="gm">GM</option>
                  <option value="admin">Admin</option>
                </select>
                <span *ngIf="!canChangeRole(member.user.id)" class="role-display">{{ getRoleDisplayName(member.role) }}</span>
              </div>
              <p class="joined-date">Joined: {{ formatDate(member.joinedAt) }}</p>
            </div>
            <div class="member-actions">
              <button *ngIf="canKickMember(member.user.id)" (click)="kickMember(member.user.id, getMemberName(member.user))" class="kick-btn">
                Kick
              </button>
              <button *ngIf="isCurrentUser(member.user.id)" (click)="leaveGroup()" class="leave-group-btn">
                Leave Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="members().length === 0 && !loading() && !error()" class="no-members">
        No members found in this group.
      </div>


    </div>
  `,
  styles: [`
    .group-detail-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .group-header {
      margin-bottom: 1rem;
    }

    .back-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .group-title {
      text-align: center;
      margin-bottom: 2rem;
    }

    .group-title h1 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .members-section {
      background: var(--bg-secondary);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
    }

    .hint-text {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-align: center;
      font-style: italic;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .member-card {
      background: var(--bg-tertiary);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .member-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow);
    }

    .member-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.2rem;
    }

    .member-name {
      cursor: pointer;
      transition: color 0.2s;
    }

    .member-name:hover {
      color: #007bff;
      text-decoration: underline;
    }

    .member-email {
      margin: 0.25rem 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .role-section {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .role-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .role-select {
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      font-size: 0.85rem;
    }

    .role-display {
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 500;
      text-transform: capitalize;
    }

    .joined-date {
      margin: 0.5rem 0 0 0;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .member-actions {
      margin-left: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .kick-btn {
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .kick-btn:hover {
      background-color: #c82333;
    }

    .loading, .error, .no-members {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .leave-group-btn {
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .leave-group-btn:hover {
      background-color: #c82333;
    }

    .error {
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .group-detail-container {
        padding: 0.5rem;
      }
      
      .group-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      
      .members-grid {
        grid-template-columns: 1fr;
      }
      
      .members-section {
        padding: 1rem;
      }
    }
  `]
})
export class GroupDetailComponent implements OnInit {
  groupId: string = '';
  members = signal<GroupMember[]>([]);
  group = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private toastService: ToastService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadMembers();
    }
  }

  loadMembers() {
    this.loading.set(true);
    this.error.set(null);

    // Load group details and members
    this.groupsService.getUserGroups().subscribe({
      next: (groups) => {
        const foundGroup = groups.find(g => g.id === this.groupId);
        this.group.set(foundGroup || null);
        
        this.groupsService.getGroupMembers(this.groupId).subscribe({
          next: (members) => {
            this.members.set(members);
            this.loading.set(false);
          },
          error: (err) => {
            this.toastService.error(err.error?.message || 'Failed to load group members');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.toastService.error('Failed to load group details');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/groups']);
  }

  getMemberName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  canKickMember(userId: string): boolean {
    const currentUser = this.authService.user();
    const currentMember = this.members().find(m => m.user.id === currentUser?.id);
    return currentMember?.role === 'admin' && userId !== currentUser?.id;
  }

  canChangeRole(userId: string): boolean {
    const currentUser = this.authService.user();
    const currentMember = this.members().find(m => m.user.id === currentUser?.id);
    return currentMember?.role === 'admin' && userId !== currentUser?.id;
  }

  isCurrentUser(userId: string): boolean {
    const currentUser = this.authService.user();
    return currentUser?.id === userId;
  }

  getRoleDisplayName(role: string): string {
    const roleNames = { admin: 'Admin', gm: 'GM', player: 'Player' };
    return roleNames[role as keyof typeof roleNames] || 'Player';
  }

  updateMemberRole(userId: string, event: any) {
    const newRole = event.target.value;
    const member = this.members().find(m => m.user.id === userId);
    if (!member) return;

    this.groupsService.updateMemberRole(this.groupId, userId, newRole).subscribe({
      next: () => {
        member.role = newRole;
        this.toastService.success(`Updated ${this.getMemberName(member.user)}'s role to ${this.getRoleDisplayName(newRole)}`);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update member role');
        // Reset the select to original value
        event.target.value = member.role;
      }
    });
  }

  viewUserDecks(userId: string, userName: string) {
    this.router.navigate(['/decks/user', userId], {
      queryParams: { userName, groupId: this.groupId }
    });
  }

  async kickMember(userId: string, memberName: string) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Kick Member',
      message: `Are you sure you want to kick ${memberName} from the group?`,
      confirmText: 'Kick',
      type: 'danger'
    });

    if (confirmed) {
      this.groupsService.kickMember(this.groupId, userId).subscribe({
        next: () => {
          this.toastService.success(`Successfully kicked ${memberName} from the group`);
          this.loadMembers();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to kick member');
        }
      });
    }
  }

  async leaveGroup() {
    const group = this.group();
    const groupName = group?.name || 'this group';
    
    const confirmed = await this.confirmationService.confirm({
      title: 'Leave Group',
      message: `Are you sure you want to leave "${groupName}"?`,
      confirmText: 'Leave',
      type: 'warning'
    });

    if (confirmed) {
      this.groupsService.leaveGroup(this.groupId).subscribe({
        next: (result) => {
          if (result.groupDeleted) {
            this.toastService.info(`Left group and deleted "${groupName}" as you were the last member`);
          } else {
            this.toastService.success(`Successfully left "${groupName}"`);
          }
          this.router.navigate(['/groups']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to leave group');
        }
      });
    }
  }
}