import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-auth-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent {
  mode = computed(() => this.route.snapshot.routeConfig?.path?.includes('register') ? 'register' : 'login');
  loginForm = { email: '', password: '' };
  registerForm = { fullName: '', username: '', email: '', password: '' };
  loginTarget: 'DEVELOPER' | 'ADMIN' = 'DEVELOPER';
  loading = false;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login() {
    this.loginForm.email = this.loginForm.email.trim();
    this.loading = true;
    this.api.login(this.loginForm).subscribe({
      next: (res) => {
        this.loading = false;
        const role = res?.user?.role;
        if (this.loginTarget === 'ADMIN' && role !== 'ADMIN') {
          this.toast.show('This account is not an admin account.');
          this.router.navigateByUrl('/dashboard');
          return;
        }
        this.toast.show('Login successful');
        this.router.navigateByUrl(this.loginTarget === 'ADMIN' ? '/admin' : '/dashboard');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(this.errorMessage(err, 'Login failed'));
      }
    });
  }

  register() {
    this.registerForm.fullName = this.registerForm.fullName.trim();
    this.registerForm.username = this.registerForm.username.trim();
    this.registerForm.email = this.registerForm.email.trim();

    if (this.registerForm.username.trim().length < 3) {
      this.toast.show('Username must be at least 3 characters.');
      return;
    }

    if (this.registerForm.password.length < 8) {
      this.toast.show('Password must be at least 8 characters.');
      return;
    }

    this.loading = true;
    this.api.register(this.registerForm).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Registered. Please login.');
        this.router.navigate(['/auth/login'], { queryParams: { email: this.registerForm.email } });
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(this.errorMessage(err, 'Registration failed'));
      }
    });
  }

  private errorMessage(err: any, fallback: string) {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.error?.errors) {
      return Object.values(err.error.errors).join(', ');
    }

    if (err?.error?.fields) {
      return Object.values(err.error.fields).join(', ');
    }

    if (err?.status === 0) {
      return 'Cannot connect to backend gateway. Please make sure API Gateway is running on localhost:8080.';
    }

    if (err?.status === 400) {
      return 'Invalid details. Use a unique email and username, and a password with at least 8 characters.';
    }

    if (err?.status === 409) {
      return err?.error?.message || 'Email or username is already registered.';
    }

    if (err?.status >= 500) {
      return 'Backend server error. Please check AuthService logs and verify database/Redis connectivity.';
    }

    return fallback;
  }
}
