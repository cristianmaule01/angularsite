import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Add auth token to requests
  const token = authService.getAuthToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Only logout if it's not a group join or invite accept password error
        const isGroupJoinError = req.url.includes('/groups/') && (req.url.includes('/join') || req.url.includes('/accept'));
        if (!isGroupJoinError) {
          // Session expired or unauthorized
          authService.logout();
          toastService.error('Your session has expired. Please log in again.');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};