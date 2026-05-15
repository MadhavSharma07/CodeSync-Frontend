import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Project } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-workspace-create',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './workspace-create.component.html',
  styleUrl: './workspace-create.component.scss'
})
export class WorkspaceCreateComponent implements OnInit {
  projects = signal<Project[]>([]);
  languages = signal<string[]>(['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust']);
  projectForm = { name: '', description: '', language: 'Java', visibility: 'PUBLIC' as const };

  constructor(public api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.api.languages().subscribe({ next: (items) => this.languages.set(items), error: () => undefined });
    this.loadProjects();
  }

  loadProjects() {
    const user = this.api.user();
    if (!user) return;
    this.api.myProjects(user.userId).subscribe({
      next: (items) => this.projects.set(items),
      error: () => this.toast.show('Failed to load projects.')
    });
  }

  createProject() {
    if (!this.projectForm.name.trim()) {
      this.toast.show('Project name is required.');
      return;
    }
    this.api.createProject(this.projectForm).subscribe({
      next: (project) => {
        this.projects.update((items) => [project, ...items]);
        this.toast.show('Project created');
      },
      error: () => this.toast.show('Project create failed')
    });
  }
}

