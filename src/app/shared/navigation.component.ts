import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand" (click)="goToDashboard()">
          <span class="brand-icon">⚔️</span>
          <span class="brand-text">Commander Groups</span>
        </div>

        <div class="nav-menu" [class.active]="mobileMenuOpen()">
          <a routerLink="/groups" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-link">
            <span class="nav-icon">👥</span>
            My Groups
          </a>
          <a routerLink="/decks" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-link">
            <span class="nav-icon">🃏</span>
            My Decks
          </a>
          <a routerLink="/invites" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-link">
            <span class="nav-icon">📨</span>
            Group Invites
          </a>
          <a routerLink="/sent-invites" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-link">
            <span class="nav-icon">📤</span>
            Sent Invites
          </a>
          <a routerLink="/profile" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-link">
            <span class="nav-icon">👤</span>
            My Profile
          </a>
          <button (click)="logout()" class="nav-link logout-btn">
            <span class="nav-icon">🚪</span>
            Logout
          </button>
        </div>

        <button class="mobile-menu-btn" (click)="toggleMobileMenu()" [class.active]="mobileMenuOpen()">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--bg-secondary);
      box-shadow: 0 2px 4px var(--shadow);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
    }

    .brand-icon {
      font-size: 1.5rem;
    }

    .brand-text {
      font-size: 1.1rem;
    }

    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      gap: 4px;
      margin-left: auto;
    }

    .mobile-menu-btn span {
      width: 25px;
      height: 3px;
      background: var(--text-primary);
      transition: 0.3s;
      transform-origin: center;
    }

    .mobile-menu-btn.active span:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: 2rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: var(--text-secondary);
      border-radius: 6px;
      transition: all 0.2s;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .nav-link:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }

    .nav-link.active {
      background: #007bff;
      color: white;
    }

    .nav-link.active:hover {
      background: #0056b3;
    }

    .logout-btn {
      color: #dc3545;
    }

    .logout-btn:hover {
      background: var(--hover-bg);
      color: #ff6b6b;
    }

    .nav-icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: flex;
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
      }

      .nav-brand {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
      }

      .brand-text {
        display: inline;
      }

      .nav-menu {
        display: none;
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: var(--bg-secondary);
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        gap: 0;
        margin-left: 0;
      }

      .nav-menu.active {
        display: flex;
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav-link {
        width: 100%;
        justify-content: flex-start;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 0 0.5rem;
      }
    }
  `]
})
export class NavigationComponent {
  mobileMenuOpen = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  toggleMobileMenu() {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.closeMobileMenu();
  }

  logout() {
    this.authService.logout();
    this.toastService.success('Successfully logged out. See you next time!');
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }
}