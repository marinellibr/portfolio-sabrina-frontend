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
    return this.http.post<AuthResponse>(`${this.baseUrl}/v1/auth/login`, credentials).pipe(
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
    this.clearStoredToken();
    this.authState.set({ token: null, isAuthenticated: false });
    this.router.navigate(['/login']);
  }

  setToken(token: string): void {
    this.storeToken(token);
    this.authState.set({ token, isAuthenticated: true });
  }

  getToken(): string | null {
    return this.authState().token;
  }

  // O token fica primariamente em memória (signal). Usamos sessionStorage
  // apenas para sobreviver a reloads da mesma aba — diferente do localStorage,
  // ele é apagado ao fechar a aba, reduzindo a janela de exposição em caso de
  // XSS e evitando que o token persista indefinidamente no dispositivo.
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private storeToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(this.tokenKey, token);
    } catch {
      /* sessionStorage indisponível (ex: modo privado) — token segue em memória */
    }
  }

  private clearStoredToken(): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(this.tokenKey);
      // Remove resquícios de versões anteriores que usavam localStorage.
      window.localStorage.removeItem(this.tokenKey);
    } catch {
      /* ignore */
    }
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  handleUnauthorized(): void {
    this.logout();
  }
}
