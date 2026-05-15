import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, CodeSyncUser } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  users = signal<CodeSyncUser[]>([]);
  visibleUsers = signal<CodeSyncUser[]>([]);
  selectedRecipientIds = signal<number[]>([]);

  filter = { query: '', role: 'ALL' as 'ALL' | 'DEVELOPER' | 'ADMIN', active: 'ALL' as 'ALL' | 'ACTIVE' | 'INACTIVE' };
  form = { title: 'Platform update', message: '', deepLinkUrl: '/admin', onlySelected: false };

  constructor(private api: ApiService, private toast: ToastService, private router: Router) {}

  ngOnInit() {
    this.api.profile().subscribe({
      next: (user) => {
        if (user.role !== 'ADMIN') {
          this.toast.show('Access denied. Admin role is required.');
          this.router.navigateByUrl('/dashboard');
          return;
        }
        this.loadUsers();
      },
      error: () => {
        this.toast.show('Session expired. Please login again.');
        this.api.clearSession();
        this.router.navigateByUrl('/auth/login');
      }
    });
  }

  loadUsers() {
    this.api.allUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.applyFilters();
      },
      error: () => this.toast.show('Admin users load failed')
    });
  }

  applyFilters() {
    const q = this.filter.query.trim().toLowerCase();
    const items = this.users().filter((u) => {
      const matchQ = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q);
      const matchRole = this.filter.role === 'ALL' || u.role === this.filter.role;
      const matchActive =
        this.filter.active === 'ALL' ||
        (this.filter.active === 'ACTIVE' && Boolean(u.isActive)) ||
        (this.filter.active === 'INACTIVE' && !u.isActive);
      return matchQ && matchRole && matchActive;
    });
    this.visibleUsers.set(items);
  }

  toggleRecipient(userId: number) {
    const set = new Set(this.selectedRecipientIds());
    if (set.has(userId)) set.delete(userId);
    else set.add(userId);
    this.selectedRecipientIds.set(Array.from(set));
  }

  selectVisible() {
    this.selectedRecipientIds.set(this.visibleUsers().map((u) => u.userId));
  }

  clearSelection() {
    this.selectedRecipientIds.set([]);
  }

  sendBroadcast() {
    const recipientIds = this.form.onlySelected
      ? this.selectedRecipientIds()
      : this.visibleUsers().map((user) => user.userId);

    if (!this.form.message.trim()) {
      this.toast.show('Broadcast message is required.');
      return;
    }
    if (!recipientIds.length) {
      this.toast.show('No recipients selected.');
      return;
    }

    this.api.broadcast({
      title: this.form.title || 'Platform update',
      message: this.form.message,
      deepLinkUrl: this.form.deepLinkUrl || '/admin',
      recipientIds
    }).subscribe({
      next: () => this.toast.show('Broadcast sent'),
      error: () => this.toast.show('Broadcast failed')
    });
  }
}
