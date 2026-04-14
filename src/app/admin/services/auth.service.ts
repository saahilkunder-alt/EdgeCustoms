import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../models/job.model';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
}

// Simple PIN-based auth (no backend)
// SHA1 hashes of the access keys
const CREDENTIALS: { [key in UserRole]: string } = {
  admin: '53f962616be53ff377cba5cd98791383d76f6294',
  staff: 'a0617f24654bb61a04fdaf23e7c1183db710253e'
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

  async login(role: UserRole, pin: string): Promise<boolean> {
    const hashed = await this.hashInput(pin);
    if (CREDENTIALS[role] === hashed) {
      const state: AuthState = { isAuthenticated: true, role };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
      this.authState.next(state);
      return true;
    }
    return false;
  }

  private async hashInput(input: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
