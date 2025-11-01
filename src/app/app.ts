import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { ThemeService } from './shared/theme.service';
import { ToastComponent } from './shared/toast.component';
import { ConfirmationModalComponent } from './shared/confirmation-modal.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastComponent, ConfirmationModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-confirmation-modal></app-confirmation-modal>
  `,
  styles: []
})
export class App implements OnInit {
  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize theme based on user preference
    const user = this.authService.user();
    if (user?.themePreference) {
      this.themeService.setTheme(user.themePreference as 'light' | 'dark');
    }

    // Wait for router to initialize, then check if we need to redirect
    setTimeout(() => {
      const currentUrl = this.router.url;
      if (currentUrl === '/' || currentUrl === '') {
        if (this.authService.isAuthenticated) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      }
    }, 0);
  }
}
