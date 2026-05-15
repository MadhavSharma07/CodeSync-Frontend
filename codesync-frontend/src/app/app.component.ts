import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './core/api.service';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  user = computed(() => this.api.user());
  unreadCount = signal(0);
  private badgePollTimer: number | null = null;

  constructor(public api: ApiService, public toast: ToastService, private router: Router) {}

  ngOnInit() {
    if (!this.api.hasSession()) return;
    this.api.profile().subscribe({
      next: () => {
        this.loadNotificationBadge();
        this.badgePollTimer = window.setInterval(() => this.loadNotificationBadge(), 20000);
      },
      error: () => {
        this.api.clearSession();
        this.router.navigateByUrl('/auth/login');
      }
    });
  }

  ngOnDestroy() {
    if (this.badgePollTimer) window.clearInterval(this.badgePollTimer);
  }

  logout() {
    this.api.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  private finishLogout() {
    if (this.badgePollTimer) window.clearInterval(this.badgePollTimer);
    this.badgePollTimer = null;
    this.unreadCount.set(0);
    this.api.clearSession();
    this.toast.show('Logged out');
    this.router.navigateByUrl('/auth/login');
  }

  private loadNotificationBadge() {
    this.api.notificationBadge().subscribe({ next: (res) => this.unreadCount.set(res.unreadCount || 0), error: () => undefined });
  }
}
