import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  themePreference?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  get user() {
    return this.currentUser.asReadonly();
  }

  get isAuthenticated() {
    const token = this.token();
    if (!token) return false;
    
    // Check if token is expired (basic JWT check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.log('Token expired, logging out');
        this.handleSessionExpired();
        return false;
      }
      return true;
    } catch (e) {
      console.log('Token validation error:', e);
      return false;
    }
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.nestUrl}/auth/register`, data)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.nestUrl}/auth/login`, data)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  logout() {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  handleSessionExpired() {
    this.logout();
  }

  getAuthToken(): string | null {
    return this.token();
  }

  private handleAuthSuccess(response: AuthResponse) {
    this.currentUser.set(response.user);
    this.token.set(response.token);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }

  updateProfile(data: { firstName?: string; lastName?: string; themePreference?: string }): Observable<User> {
    return this.http.put<User>(`${environment.nestUrl}/auth/profile`, data);
  }

  updateUserData(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private loadFromStorage() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(userStr));
    }
  }
}