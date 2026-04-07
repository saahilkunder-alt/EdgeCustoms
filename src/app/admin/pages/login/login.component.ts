import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/job.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  selectedRole: UserRole = 'admin';
  pin = '';
  error = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.pin = '';
    this.error = '';
  }

  addDigit(digit: string): void {
    if (this.pin.length < 4) {
      this.pin += digit;
      this.error = '';
    }
    if (this.pin.length === 4) {
      this.attemptLogin();
    }
  }

  deleteDigit(): void {
    this.pin = this.pin.slice(0, -1);
    this.error = '';
  }

  private attemptLogin(): void {
    this.isLoading = true;
    setTimeout(() => {
      const success = this.auth.login(this.selectedRole, this.pin);
      this.isLoading = false;
      if (success) {
        this.router.navigate(['/admin']);
      } else {
        this.error = 'Invalid PIN. Try again.';
        this.pin = '';
      }
    }, 300);
  }
}
