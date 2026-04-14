import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/job.model';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  selectedRole: UserRole | null = 'admin';
  pin = '';
  error = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.pin = '';
    this.error = '';
  }

  async login(): Promise<void> {
    if (!this.selectedRole || !this.pin) {
      this.error = 'Please enter your password.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const success = await this.auth.login(this.selectedRole, this.pin);
      this.isLoading = false;
      if (success) {
        this.router.navigate(['/edge-staff']);
      } else {
        this.error = 'Invalid password. Please try again.';
        this.pin = '';
      }
    } catch (e) {
      this.isLoading = false;
      this.error = 'Secure authentication failed. Please try again.';
    }
  }
}
