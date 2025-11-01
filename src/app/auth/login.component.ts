import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginData } from './auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand-header">
          <span class="brand-icon">⚔️</span>
          <h1 class="brand-title">Commander Groups</h1>
        </div>
        <h2>Login</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="loginData.email" 
              required 
              email
              #email="ngModel"
            >
            <div *ngIf="email.invalid && email.touched" class="error">
              Valid email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="loginData.password" 
              required
              #password="ngModel"
            >
            <div *ngIf="password.invalid && password.touched" class="error">
              Password is required
            </div>
          </div>



          <button 
            type="submit" 
            [disabled]="loginForm.invalid || loading()"
            class="submit-btn"
          >
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="auth-link">
          Don't have an account? 
          <a (click)="goToRegister()">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      box-sizing: border-box;
    }

    .auth-card {
      background: #1e1e1e;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 400px;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #404040;
    }

    .brand-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .brand-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #e0e0e0;
      margin: 0;
      letter-spacing: -0.5px;
    }

    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #e0e0e0;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #b0b0b0;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #404040;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
      background-color: #2d2d2d;
      color: #e0e0e0;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .submit-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .auth-link {
      text-align: center;
      margin-top: 1rem;
    }

    .auth-link a {
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 0.5rem;
      }
      
      .auth-card {
        padding: 1.5rem;
        border-radius: 4px;
      }
      
      .brand-title {
        font-size: 1.5rem;
      }
      
      .brand-icon {
        font-size: 2rem;
      }
      
      h2 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
      }
      
      input {
        padding: 0.875rem;
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      .submit-btn {
        padding: 0.875rem;
        font-size: 16px;
      }
    }
  `]
})
export class LoginComponent {
  loginData: LoginData = { email: '', password: '' };
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Welcome back! Login successful.');
        
        // Check for redirect URL
        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('redirectUrl');
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Login failed');
      }
    });
  }

  goToRegister() {
    // Preserve redirect URL when going to register
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      localStorage.setItem('redirectUrl', redirectUrl);
    }
    this.router.navigate(['/register']);
  }
}