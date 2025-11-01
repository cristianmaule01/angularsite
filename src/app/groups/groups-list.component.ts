import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService, Group } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { ConfirmationService } from '../shared/confirmation.service';
import { NavigationComponent } from '../shared/navigation.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="groups-container">
      <!-- My Groups -->
      <div class="my-groups-section">
        <div class="header-with-action">
          <h3>My Groups</h3>
          <div class="action-buttons">
            <button (click)="goToSearchGroups()" class="search-icon-btn" title="Search Groups">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button (click)="goToCreateGroup()" class="create-icon-btn" title="Create Group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div *ngIf="loading()" class="loading">Loading groups...</div>
        
        <div *ngIf="myGroups().length === 0 && !loading() && !error()" class="no-groups">
          You haven't joined any groups yet.
        </div>
        
        <div *ngIf="myGroups().length > 0" class="hints">
          <div *ngIf="!isDesktop()" class="mobile-hint">💡 Tap a group to expand details</div>
        </div>
        
        <div class="groups-grid">
          <div *ngFor="let group of myGroups()" class="group-card">
            <div class="group-info" (click)="toggleGroupDetails(group.id)">
              <div class="group-title">{{ group.name }}</div>
            </div>
            
            <div *ngIf="expandedGroupId() === group.id || isDesktop()" class="group-details">
              <div class="details-header">
                <div class="details-info">
                  <p>Created by: {{ getCreatorName(group.creator) }}</p>
                  <p class="created-date">{{ formatDate(group.createdAt) }}</p>
                </div>
                <div class="action-buttons-group">
                  <button (click)="shareGroup(group.id)" class="share-icon-btn" title="Share Group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button (click)="viewGroup(group.id)" class="members-icon-btn" title="View Members">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      <path d="m22 21-3-3m0 0a2 2 0 1 0-2.83-2.83A2 2 0 0 0 19 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Share Group Overlay -->
    <div *ngIf="showShareOverlay()" class="overlay" (click)="closeShareOverlay()">
      <div class="share-modal" (click)="$event.stopPropagation()">
        <h3>Share Group</h3>
        
        <div class="share-section">
          <h4>Share Link</h4>
          <p>Share this link to invite others to join your group:</p>
          <div class="url-container">
            <input #shareInput type="text" [value]="shareUrl()" readonly class="share-url-input">
          </div>
          <button (click)="copyToClipboard(shareInput)" class="copy-btn">Copy to Clipboard</button>
        </div>

        <div class="divider">OR</div>

        <div class="invite-section">
          <h4>Send Direct Invite</h4>
          <p>Search for a user to send them a direct invitation:</p>
          <div class="user-search">
            <input 
              type="text" 
              [(ngModel)]="userSearchQuery" 
              (input)="searchUsers()" 
              placeholder="Search by name or email..."
              class="user-search-input"
            >
            <div *ngIf="userSearchResults().length > 0" class="search-results">
              <div 
                *ngFor="let user of userSearchResults()" 
                (click)="selectUser(user)"
                class="user-result"
              >
                <span class="user-name">{{ getUserDisplayName(user) }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
          </div>
          <div *ngIf="selectedUser()" class="selected-user">
            <span>Selected: {{ getUserDisplayName(selectedUser()!) }}</span>
            <button (click)="sendDirectInvite()" [disabled]="sendingInvite()" class="send-invite-btn">
              {{ sendingInvite() ? 'Sending...' : 'Send Invite' }}
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button (click)="closeShareOverlay()" class="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .groups-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-with-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
    }

    .header-with-action h3 {
      margin: 0;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .create-icon-btn, .search-icon-btn {
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .create-icon-btn {
      background: #28a745;
      color: white;
    }

    .create-icon-btn:hover {
      background-color: #218838;
    }

    .search-icon-btn {
      background: #007bff;
      color: white;
    }

    .search-icon-btn:hover {
      background-color: #0056b3;
    }



    .my-groups-section {
      background: var(--bg-secondary);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
      margin-bottom: 2rem;
    }

    .my-groups-section h3 {
      color: var(--text-primary);
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .group-card {
      background: var(--bg-tertiary);
      border-radius: 8px;
      padding: 0.75rem;
      box-shadow: 0 2px 4px var(--shadow);
      display: flex;
      flex-direction: column;
    }

    .group-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .group-info:hover {
      background-color: var(--hover-bg);
      border-radius: 4px;
    }

    .group-title {
      margin: 0;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .group-details {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .details-info {
      flex: 1;
    }

    .details-info p {
      margin: 0.25rem 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .action-buttons-group {
      display: flex;
      gap: 0.5rem;
    }

    .members-icon-btn, .share-icon-btn {
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      aspect-ratio: 1;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
      flex-shrink: 0;
      color: white;
    }

    .members-icon-btn {
      background: #007bff;
    }

    .members-icon-btn:hover {
      background-color: #0056b3;
    }

    .share-icon-btn {
      background: #28a745;
    }

    .share-icon-btn:hover {
      background-color: #218838;
    }

    .hints {
      text-align: center;
      margin-bottom: 1rem;
    }

    .mobile-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-style: italic;
    }





    .created-date {
      font-size: 0.8rem !important;
      color: var(--text-muted) !important;
    }



    .loading, .error, .no-groups {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .error {
      color: #dc3545;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .share-modal {
      background: var(--bg-secondary);
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .share-modal h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
    }

    .share-modal p {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
    }

    .url-container {
      margin-bottom: 1.5rem;
    }

    .share-url-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-family: monospace;
      font-size: 0.9rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .cancel-btn, .copy-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .cancel-btn {
      background: #6c757d;
      color: white;
    }

    .cancel-btn:hover {
      background: #5a6268;
    }

    .copy-btn {
      background: #007bff;
      color: white;
    }

    .copy-btn:hover {
      background: #0056b3;
    }

    .share-section, .invite-section {
      margin-bottom: 1.5rem;
    }

    .share-section h4, .invite-section h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .divider {
      text-align: center;
      margin: 1.5rem 0;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .user-search {
      position: relative;
      margin-bottom: 1rem;
    }

    .user-search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-size: 0.9rem;
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 4px 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
    }

    .user-result {
      padding: 0.75rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-result:hover {
      background: var(--hover-bg);
    }

    .user-result:last-child {
      border-bottom: none;
    }

    .user-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-email {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .selected-user {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--bg-tertiary);
      border-radius: 4px;
      margin-top: 0.5rem;
    }

    .send-invite-btn {
      padding: 0.5rem 1rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .send-invite-btn:hover:not(:disabled) {
      background: #218838;
    }

    .send-invite-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .groups-container {
        padding: 0.5rem;
      }
      
      .groups-grid {
        grid-template-columns: 1fr;
      }
      
      .my-groups-section {
        padding: 1rem;
      }

      .share-modal {
        padding: 1.5rem;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class GroupsListComponent implements OnInit {
  myGroups = signal<Group[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  expandedGroupId = signal<string | null>(null);
  isDesktop = signal(false);
  showShareOverlay = signal(false);
  shareUrl = signal('');
  currentGroupId = signal('');
  userSearchQuery = '';
  userSearchResults = signal<any[]>([]);
  selectedUser = signal<any>(null);
  sendingInvite = signal(false);

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMyGroups();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  loadMyGroups() {
    this.loading.set(true);
    this.error.set(null);
    
    this.groupsService.getUserGroups().subscribe({
      next: (groups) => {
        this.myGroups.set(groups);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('error');
        this.toastService.error('Failed to load groups');
        this.loading.set(false);
      }
    });
  }

  goToCreateGroup() {
    this.router.navigate(['/groups/create']);
  }

  goToSearchGroups() {
    this.router.navigate(['/groups/search']);
  }



  viewGroup(groupId: string) {
    this.router.navigate(['/groups', groupId]);
  }

  getCreatorName(creator: any): string {
    if (creator.firstName && creator.lastName) {
      return `${creator.firstName} ${creator.lastName}`;
    }
    return creator.firstName || creator.lastName || creator.email;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }



  toggleGroupDetails(groupId: string) {
    if (!this.isDesktop()) {
      this.expandedGroupId.set(this.expandedGroupId() === groupId ? null : groupId);
    }
  }

  checkScreenSize() {
    this.isDesktop.set(window.innerWidth > 768);
  }

  shareGroup(groupId: string) {
    const currentUser = this.authService.user();
    if (!currentUser) return;
    
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/invite/${currentUser.id}/${groupId}`;
    this.shareUrl.set(inviteUrl);
    this.currentGroupId.set(groupId);
    this.showShareOverlay.set(true);
  }

  closeShareOverlay() {
    this.showShareOverlay.set(false);
    this.userSearchQuery = '';
    this.userSearchResults.set([]);
    this.selectedUser.set(null);
  }

  copyToClipboard(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    this.toastService.success('Link copied to clipboard!');
  }

  searchUsers() {
    if (this.userSearchQuery.trim().length < 2) {
      this.userSearchResults.set([]);
      return;
    }

    this.groupsService.searchUsers(this.userSearchQuery).subscribe({
      next: (users) => {
        this.userSearchResults.set(users);
      },
      error: () => {
        this.userSearchResults.set([]);
      }
    });
  }

  selectUser(user: any) {
    this.selectedUser.set(user);
    this.userSearchResults.set([]);
    this.userSearchQuery = this.getUserDisplayName(user);
  }

  getUserDisplayName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email;
  }

  sendDirectInvite() {
    const user = this.selectedUser();
    if (!user) return;

    this.sendingInvite.set(true);
    this.groupsService.sendInvite(this.currentGroupId(), user.id).subscribe({
      next: () => {
        this.toastService.success(`Invite sent to ${this.getUserDisplayName(user)}!`);
        this.closeShareOverlay();
        this.sendingInvite.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to send invite');
        this.sendingInvite.set(false);
      }
    });
  }
}