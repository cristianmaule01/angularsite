import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';
import { ThemeService } from '../shared/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="profile-container">
      <header class="profile-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>

      <div class="profile-section">
        <h3>My Profile</h3>
        
        <form (ngSubmit)="updateProfile()" #profileForm="ngForm" class="profile-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName"
              [(ngModel)]="profileData.firstName"
              placeholder="Enter your first name"
            >
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName"
              [(ngModel)]="profileData.lastName"
              placeholder="Enter your last name"
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [value]="profileData.email"
              disabled
              class="disabled-input"
            >
            <small class="help-text">Email cannot be changed</small>
          </div>

          <div class="form-group">
            <label for="theme">Theme Preference</label>
            <select 
              id="theme" 
              name="theme"
              [(ngModel)]="profileData.themePreference"
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="updating()" class="submit-btn">
              {{ updating() ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-header {
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

    .profile-section {
      background: var(--bg-secondary);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
    }

    .profile-section h3 {
      margin-top: 0;
      color: var(--text-primary);
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .profile-form {
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

    .form-group input,
    .form-group select {
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

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #007bff;
    }

    .disabled-input {
      background-color: var(--hover-bg) !important;
      color: var(--text-muted) !important;
      cursor: not-allowed;
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .form-actions {
      display: block;
      margin-top: 2rem;
    }

    .submit-btn {
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 0.75rem 2rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 !important;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .submit-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 0.5rem;
      }
      
      .profile-section {
        padding: 1.5rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    themePreference: 'dark'
  };
  updating = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.profileData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        themePreference: user.themePreference || 'dark'
      };
      this.themeService.setTheme(this.profileData.themePreference as 'light' | 'dark');
    }
  }

  updateProfile() {
    this.themeService.setTheme(this.profileData.themePreference as 'light' | 'dark');
    this.updating.set(true);
    
    this.authService.updateProfile({
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      themePreference: this.profileData.themePreference
    }).subscribe({
      next: (updatedUser) => {
        this.updating.set(false);
        this.authService.updateUserData(updatedUser);
        this.toastService.success('Profile updated successfully!');
      },
      error: (err) => {
        this.updating.set(false);
        this.toastService.error(err.error?.message || 'Failed to update profile');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}