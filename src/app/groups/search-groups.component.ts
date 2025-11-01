import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService, Group } from './groups.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-search-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="search-container">
      <header class="search-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>

      <div class="search-section">
        <h3>Search Groups</h3>
        
        <div class="search-input-section">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="searchGroups()"
            placeholder="Search for groups..."
            class="search-input"
          >
        </div>

        <div *ngIf="searchResults().length > 0" class="search-results">
          <div *ngFor="let group of searchResults()" class="group-result">
            <div class="group-info">
              <div class="group-title-row">
                <h4>{{ group.name }}</h4>
                <span class="protection-badge" [class.protected]="group.passwordHash" [class.open]="!group.passwordHash">
                  {{ group.passwordHash ? '🔒 Protected' : '🔓 Open' }}
                </span>
              </div>
              <p>Created by: {{ getCreatorName(group.creator) }}</p>
              <p class="created-date">{{ formatDate(group.createdAt) }}</p>
            </div>
            
            <div *ngIf="selectedGroup()?.id === group.id && group.passwordHash" class="password-section">
              <input 
                type="password" 
                [(ngModel)]="groupPassword" 
                placeholder="Enter group password"
                class="password-input"
              >
            </div>
            
            <div class="group-actions">
              <button 
                (click)="selectGroup(group)" 
                [disabled]="joining()"
                class="join-btn"
              >
                {{ selectedGroup()?.id === group.id && group.passwordHash ? 'Join with Password' : 'Join Group' }}
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="searchQuery && searchResults().length === 0 && !searching()" class="no-results">
          No groups found matching "{{ searchQuery }}"
        </div>

        <div *ngIf="searching()" class="loading">
          Searching...
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .search-header {
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

    .search-section {
      background: var(--bg-secondary);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
    }

    .search-section h3 {
      margin-top: 0;
      color: var(--text-primary);
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .search-input-section {
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid var(--border-color);
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .search-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .group-result {
      background: var(--bg-tertiary);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .group-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }

    .group-info h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      flex: 1;
    }

    .protection-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .protection-badge.protected {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .protection-badge.open {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .group-info p {
      margin: 0.25rem 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .created-date {
      font-size: 0.8rem !important;
      color: var(--text-muted) !important;
    }

    .password-section {
      margin: 0.5rem 0;
    }

    .password-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      box-sizing: border-box;
    }

    .password-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .group-actions {
      display: flex;
      justify-content: flex-end;
    }

    .join-btn {
      padding: 0.75rem 1.5rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .join-btn:hover:not(:disabled) {
      background-color: #218838;
    }

    .join-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .no-results, .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      font-style: italic;
    }

    @media (max-width: 768px) {
      .search-container {
        padding: 0.5rem;
      }
      
      .search-section {
        padding: 1.5rem;
      }
      
      .group-result {
        padding: 1rem;
      }
    }
  `]
})
export class SearchGroupsComponent {
  searchQuery = '';
  groupPassword = '';
  searchResults = signal<Group[]>([]);
  selectedGroup = signal<Group | null>(null);
  searching = signal(false);
  joining = signal(false);

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private toastService: ToastService
  ) {}

  searchGroups() {
    if (this.searchQuery.trim().length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.searching.set(true);
    this.groupsService.searchGroups(this.searchQuery).subscribe({
      next: (groups) => {
        this.searchResults.set(groups);
        this.searching.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.searching.set(false);
      }
    });
  }

  selectGroup(group: Group) {
    if (group.passwordHash && this.selectedGroup()?.id !== group.id) {
      this.selectedGroup.set(group);
      this.groupPassword = '';
      return;
    }

    this.joinGroup(group);
  }

  joinGroup(group: Group) {
    this.joining.set(true);
    
    const joinData = {
      groupId: group.id,
      password: group.passwordHash ? this.groupPassword : undefined
    };

    this.groupsService.joinGroup(joinData).subscribe({
      next: () => {
        this.joining.set(false);
        this.toastService.success(`Successfully joined "${group.name}"!`);
        this.router.navigate(['/groups']);
      },
      error: (err) => {
        this.joining.set(false);
        this.toastService.error(err.error?.message || 'Failed to join group');
        if (group.passwordHash) {
          this.groupPassword = '';
        }
      }
    });
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

  goBack() {
    this.router.navigate(['/groups']);
  }
}