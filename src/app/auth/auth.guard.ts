import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }
    
    // Store the intended URL for redirect after login
    localStorage.setItem('redirectUrl', state.url);
    
    // Show different message for invitation URLs
    if (state.url.includes('/invite/')) {
      this.toastService.warning('Register or login to join the group.');
    } else {
      this.toastService.warning('Please log in to access this page.');
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}