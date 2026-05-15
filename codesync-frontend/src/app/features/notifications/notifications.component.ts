import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ApiService, NotificationItem } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  items = signal<NotificationItem[]>([]);
  unreadCount = signal(0);
  activeFilter = signal<'all' | 'unread'>('all');
  loading = signal(false);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.refreshAll();
  }

  load() {
    this.loading.set(true);
    const request = this.activeFilter() === 'unread' ? this.api.unreadNotifications() : this.api.notifications();
    request.subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Notifications load failed');
      }
    });
  }

  loadBadge() {
    this.api.notificationBadge().subscribe({ next: (res) => this.unreadCount.set(res.unreadCount || 0), error: () => undefined });
  }

  refreshAll() {
    this.loadBadge();
    this.load();
  }

  setFilter(filter: 'all' | 'unread') {
    this.activeFilter.set(filter);
    this.load();
  }

  markRead(item: NotificationItem) {
    if (item.isRead) return;
    this.api.markRead(item.notificationId).subscribe({
      next: () => {
        this.items.update((items) => items.map((n) => n.notificationId === item.notificationId ? { ...n, isRead: true } : n));
        this.loadBadge();
      },
      error: () => this.toast.show('Could not mark as read')
    });
  }

  markAllRead() {
    this.api.markAllRead().subscribe({ next: () => this.refreshAll(), error: () => this.toast.show('Read state update failed') });
  }

  clearRead() {
    this.api.clearReadNotifications().subscribe({ next: () => this.refreshAll(), error: () => this.toast.show('Clear read failed') });
  }

  trackById(_: number, item: NotificationItem) {
    return item.notificationId;
  }
}
