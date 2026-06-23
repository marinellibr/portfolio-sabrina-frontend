import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { LoginRequest, AuthResponse, AuthState } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'https://portfolio-sabrina-backend.vercel.app';
  private readonly tokenKey = 'auth_token';

  authState = signal<AuthState>({
    token: this.getStoredToken(),
    isAuthenticated: !!this.getStoredToken(),
  });

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authState.set({ token: null, isAuthenticated: false });
    this.router.navigate(['/login']);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authState.set({ token, isAuthenticated: true });
  }

  getToken(): string | null {
    return this.authState().token;
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  handleUnauthorized(): void {
    this.logout();
  }
}
