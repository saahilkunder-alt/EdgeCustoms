import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../models/job.model';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
}

// Simple PIN-based auth (no backend)
// SHA1 hashes of the 21-character keys
// Admin: EDGE-PRIME-2026-PORTA -> a46e00327616de0fbba46e65205adc3a05963f4e
// Staff: EDGE-STAFF-2026-ACCESS -> d2f988b0bd099cf028190e7122cab94c29f47f2b
const CREDENTIALS: { [key in UserRole]: string } = {
  admin: 'a46e00327616de0fbba46e65205adc3a05963f4e',
  staff: 'd2f988b0bd099cf028190e7122cab94c29f47f2b'
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
    } catch {}
    return { isAuthenticated: false, role: null };
  }
}
