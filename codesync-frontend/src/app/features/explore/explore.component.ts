import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Project } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-explore',
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit {
  projects = signal<Project[]>([]);
  search = '';

  constructor(public api: ApiService, private toast: ToastService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const request = this.search.trim() ? this.api.searchProjects(this.search.trim()) : this.api.publicProjects();
    request.subscribe({
      next: (items) => this.projects.set(items),
      error: () => this.toast.show('Failed to load public projects. The gateway public route may still be protected by JWT.')
    });
  }

  open(project: Project) {
    this.router.navigate(['/workspace'], { queryParams: { projectId: project.projectId } });
  }

  star(project: Project) {
    this.api.starProject(project.projectId).subscribe({ next: () => this.load(), error: () => this.toast.show('Star failed') });
  }

  fork(project: Project) {
    this.api.forkProject(project.projectId).subscribe({
      next: (forked) => this.router.navigate(['/workspace'], { queryParams: { projectId: forked.projectId } }),
      error: () => this.toast.show('Fork failed')
    });
  }
}
