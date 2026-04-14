import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../models/job.model';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
}

// Cloudflare D1 Backend authentication

const SESSION_KEY = 'ec_auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private authState = new BehaviorSubject<AuthState>(this.loadSession());

  auth$ = this.authState.asObservable();

  get isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  get currentRole(): UserRole | null {
    return this.authState.value.role;
  }

  get isAdmin(): boolean {
    return this.authState.value.role === 'admin';
  }

  async login(role: UserRole, pin: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, pin })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const state: AuthState = { isAuthenticated: true, role };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
        this.authState.next(state);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error against D1:', e);
      throw e;
    }
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.authState.next({ isAuthenticated: false, role: null });
  }

  private loadSession(): AuthState {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const state = JSON.parse(raw) as AuthState;
        if (state.isAuthenticated && state.role) return state;
      }
    } catch { }
    return { isAuthenticated: false, role: null };
  }
}
