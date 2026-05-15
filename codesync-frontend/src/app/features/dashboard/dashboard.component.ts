import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Project } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  projects = signal<Project[]>([]);

  constructor(public api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    const user = this.api.user();
    if (!user) return;
    this.api.myProjects(user.userId).subscribe({
      next: (items) => this.projects.set(items),
      error: () => this.toast.show('Failed to load dashboard projects.')
    });
  }
}
