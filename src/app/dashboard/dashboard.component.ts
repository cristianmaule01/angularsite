import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NavigationComponent } from '../shared/navigation.component';
import { ToastService } from '../shared/toast.service';
import { DecksService } from '../decks/decks.service';
import { GroupsService } from '../groups/groups.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Welcome, {{ authService.user()?.firstName || authService.user()?.email }}!</h1>
      </header>

      <div class="dashboard-content">
        <div class="overview-section">
          <h3>Overview</h3>
          <div class="stats-grid">
            <div class="stat-card clickable" (click)="navigateToGroups()">
              <div class="stat-number">{{ groupCount() }}</div>
              <div class="stat-label">Groups Joined</div>
            </div>
            <div class="stat-card clickable" (click)="navigateToDecks()">
              <div class="stat-number">{{ deckCount() }}</div>
              <div class="stat-label">Decks Created</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">Coming Soon</div>
              <div class="stat-label">Games Played</div>
            </div>
            <div class="stat-card clickable" (click)="navigateToInvites()">
              <div class="stat-number">{{ inviteCount() }}</div>
              <div class="stat-label">Group Invites</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
    }

    .dashboard-header {
      background: var(--bg-secondary);
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px var(--shadow);
      text-align: center;
    }

    .dashboard-header h1 {
      margin: 0;
      color: var(--text-primary);
    }



    .dashboard-content {
      padding: 2rem;
      display: flex;
      justify-content: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .overview-section {
      background: var(--bg-secondary);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
      width: 100%;
      max-width: 500px;
      text-align: center;
    }

    .overview-section h3 {
      margin-top: 0;
      color: var(--text-primary);
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
      text-align: left;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .stat-card {
      background: var(--bg-tertiary);
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--border-color);
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card.clickable {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow);
    }





    @media (max-width: 768px) {
      .dashboard-content {
        padding: 1rem;
      }
      
      .dashboard-header {
        padding: 1rem;
      }
      
      .dashboard-header h1 {
        font-size: 1.25rem;
        word-break: break-word;
      }
      
      .overview-section {
        padding: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .dashboard-header {
        padding: 0.75rem;
        flex-direction: column;
        align-items: center;
      }
      
      .dashboard-header h1 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
      

      
      .dashboard-content {
        padding: 0.75rem;
      }
      

    }
  `]
})
export class DashboardComponent implements OnInit {
  groupCount = signal(0);
  deckCount = signal(0);
  inviteCount = signal(0);

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private decksService: DecksService,
    private groupsService: GroupsService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.groupsService.getUserGroups().subscribe({
      next: (groups) => this.groupCount.set(groups.length),
      error: () => this.groupCount.set(0)
    });

    this.decksService.getUserDecks().subscribe({
      next: (decks) => this.deckCount.set(decks.length),
      error: () => this.deckCount.set(0)
    });

    this.groupsService.getUserInvites().subscribe({
      next: (invites) => this.inviteCount.set(invites.filter(i => i.status === 'pending').length),
      error: () => this.inviteCount.set(0)
    });
  }

  navigateToGroups() {
    this.router.navigate(['/groups']);
  }

  navigateToDecks() {
    this.router.navigate(['/decks']);
  }

  navigateToInvites() {
    this.router.navigate(['/invites']);
  }

  getUserName(): string {
    const user = this.authService.user();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.lastName || 'Not provided';
  }




}