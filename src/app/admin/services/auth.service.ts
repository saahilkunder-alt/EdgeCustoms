import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../models/job.model';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
}

// Simple PIN-based auth (no backend)
const CREDENTIALS: { [key in UserRole]: string } = {
  admin: '1234',
  staff: '0000'
};

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

  login(role: UserRole, pin: string): boolean {
    if (CREDENTIALS[role] === pin) {
      const state: AuthState = { isAuthenticated: true, role };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
      this.authState.next(state);
      return true;
    }
    return false;
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
    } catch {}
    return { isAuthenticated: false, role: null };
  }
}
