import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ApiService, CodeFile, ExecutionJob, Project, ReviewComment, Snapshot } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { Client, IMessage } from '@stomp/stompjs';

@Component({
  selector: 'app-workspace',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  projects = signal<Project[]>([]);
  files = signal<CodeFile[]>([]);
  jobs = signal<ExecutionJob[]>([]);
  snapshots = signal<Snapshot[]>([]);
  comments = signal<ReviewComment[]>([]);
  diffRows = signal<Array<Record<string, unknown>>>([]);
  languages = signal<string[]>(['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust']);

  selectedProject = signal<Project | null>(null);
  selectedFile = signal<CodeFile | null>(null);
  selectedJob = signal<ExecutionJob | null>(null);
  selectedSnapshotA = signal<number | null>(null);
  selectedSnapshotB = signal<number | null>(null);
  editorContent = signal('');
  editorValue = '';

  fileForm = { name: 'Main.java', path: 'src/Main.java', language: 'Java', content: '' };
  folderForm = { name: 'src', path: 'src' };
  runForm = { stdin: '' };
  snapshotForm = { message: 'Initial snapshot', branch: 'main' };
  commentForm = { lineNumber: 1, content: '' };
  activePanel: 'execution' | 'snapshots' | 'review' | 'collab' = 'execution';
  collabForm = { sessionId: '' };
  collabSessionId = signal<string | null>(null);
  collabStatus = signal<'offline' | 'connecting' | 'online'>('offline');
  collabEvents = signal<string[]>([]);

  private collabClient: Client | null = null;
  private suppressCollabBroadcast = false;

  constructor(public api: ApiService, private toast: ToastService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.applyTemplateFromLanguage();
    this.api.languages().subscribe({ next: (items) => this.languages.set(items), error: () => undefined });
    const user = this.api.user();
    if (!user) return;
    this.api.myProjects(user.userId).subscribe({
      next: (items) => {
        this.projects.set(items);
        const projectId = Number(this.route.snapshot.queryParamMap.get('projectId'));
        const selected = items.find((item) => item.projectId === projectId) || items[0];
        if (selected) this.openProject(selected);
      },
      error: () => this.toast.show('Projects load failed')
    });
  }

  ngOnDestroy() {
    this.leaveCollab();
  }

  openProject(project: Project) {
    this.leaveCollab();
    this.selectedProject.set(project);
    this.api.getFiles(project.projectId).subscribe({
      next: (files) => {
        this.files.set(files);
        const firstFile = files.find((file) => !this.isFolder(file));
        if (firstFile) this.openFile(firstFile);
      },
      error: () => this.toast.show('File tree load failed')
    });
    this.api.jobsByProject(project.projectId).subscribe({ next: (jobs) => this.jobs.set(jobs), error: () => undefined });
  }

  selectProjectById(projectId: string) {
    const id = Number(projectId);
    const project = this.projects().find((item) => item.projectId === id);
    if (project) this.openProject(project);
  }

  selectFileById(fileId: string) {
    const id = Number(fileId);
    const file = this.files().find((item) => item.fileId === id);
    if (file) this.openFile(file);
  }

  createFolder() {
    const project = this.selectedProject();
    if (!project) return;
    const path = this.folderForm.path.trim();
    const name = path.split('/').filter(Boolean).pop() || this.folderForm.name.trim();
    if (!path) {
      this.toast.show('Folder path is required.');
      return;
    }
    this.api.createFolder({ projectId: project.projectId, path, name }).subscribe({
      next: (folder) => {
        this.files.update((items) => [...items, folder]);
        this.toast.show('Folder created');
      },
      error: (err) => this.toast.show(this.errorMessage(err, 'Failed to create folder.'))
    });
  }

  createFile() {
    const project = this.selectedProject();
    if (!project) return;
    const path = this.fileForm.path.trim();
    const name = path.split('/').filter(Boolean).pop() || this.fileForm.name.trim();
    if (!path) {
      this.toast.show('File path is required.');
      return;
    }
    this.api.createFile({
      projectId: project.projectId,
      path,
      name,
      language: this.fileForm.language,
      content: (this.fileForm.content || this.templateForLanguage(this.fileForm.language))
    }).subscribe({
      next: (file) => {
        this.files.update((items) => [...items, file]);
        this.openFile(file);
        this.toast.show('File created');
      },
      error: (err) => this.toast.show(this.errorMessage(err, 'Failed to create file.'))
    });
  }

  openFile(file: CodeFile) {
    if (this.isFolder(file)) return;
    this.selectedFile.set(file);
    this.api.fileContent(file.fileId).subscribe({
      next: (res) => {
        const content = res.content || file.content || '';
        this.editorContent.set(content);
        this.editorValue = content;
        this.refreshFilePanels(file.fileId);
      },
      error: () => this.toast.show('File content load failed')
    });
  }

  onEditorInput(value: string) {
    this.editorValue = value;
    if (this.suppressCollabBroadcast) return;
    this.broadcastEdit(value);
  }

  saveFile() {
    const file = this.selectedFile();
    if (!file) return;
    this.api.saveFile(file.fileId, this.editorValue).subscribe({
      next: (saved) => {
        this.selectedFile.set(saved);
        this.editorContent.set(this.editorValue);
        this.toast.show('Saved');
      },
      error: (err) => this.toast.show(this.errorMessage(err, 'Save failed.'))
    });
  }

  runCode() {
    const project = this.selectedProject();
    const file = this.selectedFile();
    if (!project || !file) return;
    this.api.runCode({
      projectId: project.projectId,
      fileId: file.fileId,
      language: file.language || project.language,
      sourceCode: this.editorValue,
      stdin: this.runForm.stdin
    }).subscribe({
      next: (job) => {
        this.selectedJob.set(job);
        this.jobs.update((items) => [job, ...items]);
        this.pollJob(job.jobId);
      },
      error: () => this.toast.show('Execution failed')
    });
  }

  createSnapshot() {
    const project = this.selectedProject();
    const file = this.selectedFile();
    if (!file) {
      this.toast.show('Please select a file first.');
      return;
    }
    const projectId = project?.projectId ?? file.projectId;
    if (!projectId) {
      this.toast.show('Please select a project first.');
      return;
    }
    this.api.createSnapshot({
      projectId,
      fileId: file.fileId,
      message: this.snapshotForm.message,
      content: this.editorValue,
      branch: this.snapshotForm.branch || 'main'
    }).subscribe({
      next: (snap) => {
        this.snapshots.update((items) => [snap, ...items]);
        this.toast.show('Snapshot created');
      },
      error: (err) => this.toast.show(this.errorMessage(err, 'Snapshot failed.'))
    });
  }

  loadDiff() {
    const a = this.selectedSnapshotA();
    const b = this.selectedSnapshotB();
    if (!a || !b) return;
    this.api.diff(a, b).subscribe({ next: (rows) => this.diffRows.set(rows), error: () => this.toast.show('Diff load failed') });
  }

  addComment() {
    const project = this.selectedProject();
    const file = this.selectedFile();
    if (!project || !file || !this.commentForm.content.trim()) return;
    this.api.addComment({
      projectId: project.projectId,
      fileId: file.fileId,
      lineNumber: this.commentForm.lineNumber,
      content: this.commentForm.content,
      columnNumber: 1
    }).subscribe({
      next: (comment) => {
        this.comments.update((items) => [...items, comment]);
        this.commentForm.content = '';
      },
      error: () => this.toast.show('Comment failed')
    });
  }

  toggleComment(comment: ReviewComment) {
    this.api.toggleComment(comment).subscribe({
      next: (updated) => this.comments.update((items) => items.map((item) => item.commentId === updated.commentId ? updated : item)),
      error: () => this.toast.show('Comment update failed')
    });
  }

  createCollabSession() {
    const project = this.selectedProject();
    const file = this.selectedFile();
    if (!project) {
      this.toast.show('Select a project first.');
      return;
    }
    if (!file) {
      this.toast.show('Open a file first.');
      return;
    }
    this.api.createSession({
      projectId: project.projectId,
      fileId: file.fileId,
      language: file.language || project.language || 'Java',
      maxParticipants: 8,
      passwordProtected: false,
      password: ''
    }).subscribe({
      next: (session: any) => {
        const sessionId = this.readSessionId(session);
        if (!sessionId) {
          this.toast.show('Session created but no session id received.');
          return;
        }
        this.collabForm.sessionId = sessionId;
        this.connectCollab(sessionId, true);
      },
      error: (err) => this.toast.show(this.errorMessage(err, 'Failed to create collab session.'))
    });
  }

  joinCollabSession() {
    const sessionId = this.collabForm.sessionId.trim();
    if (!sessionId) {
      this.toast.show('Enter session id first.');
      return;
    }
    this.connectCollab(sessionId, false);
  }

  leaveCollab() {
    const sessionId = this.collabSessionId();
    if (sessionId) {
      this.api.leaveSession(sessionId).subscribe({ next: () => undefined, error: () => undefined });
    }
    if (this.collabClient) {
      this.collabClient.deactivate();
      this.collabClient = null;
    }
    this.collabSessionId.set(null);
    this.collabStatus.set('offline');
  }

  isFolder(file: CodeFile) {
    return Boolean(file.folder || file.isFolder || !file.language);
  }

  private refreshFilePanels(fileId: number) {
    this.api.snapshots(fileId).subscribe({ next: (items) => this.snapshots.set(items), error: () => undefined });
    this.api.comments(fileId).subscribe({ next: (items) => this.comments.set(items), error: () => undefined });
  }

  private pollJob(jobId: string) {
    const tick = () => this.api.job(jobId).subscribe({
      next: (job) => {
        this.selectedJob.set(job);
        this.jobs.update((items) => items.map((item) => item.jobId === job.jobId ? job : item));
        if (['QUEUED', 'RUNNING'].includes(job.status)) window.setTimeout(tick, 1200);
      },
      error: () => undefined
    });
    window.setTimeout(tick, 1000);
  }

  private connectCollab(sessionId: string, alreadyJoined: boolean) {
    this.leaveCollab();
    this.collabStatus.set('connecting');

    const join$ = alreadyJoined ? null : this.api.joinSession(sessionId);
    const connectNow = () => {
      const token = localStorage.getItem('codesync.accessToken') || '';
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws/collab/websocket',
        reconnectDelay: 3000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {}
      });

      client.onConnect = () => {
        this.collabClient = client;
        this.collabSessionId.set(sessionId);
        this.collabStatus.set('online');
        this.pushCollabEvent(`Connected to session ${sessionId}`);

        client.subscribe(`/topic/session.${sessionId}.edit`, (message) => this.applyRemoteEdit(message));
        client.subscribe(`/topic/session.${sessionId}.events`, (message) => this.pushCollabEvent(this.readTextMessage(message)));
      };

      client.onStompError = () => {
        this.collabStatus.set('offline');
        this.toast.show('Collab socket error.');
      };

      client.onWebSocketClose = () => {
        this.collabStatus.set('offline');
      };

      client.activate();
    };

    if (!join$) {
      connectNow();
      return;
    }

    join$.subscribe({
      next: () => connectNow(),
      error: (err) => {
        this.collabStatus.set('offline');
        this.toast.show(this.errorMessage(err, 'Failed to join session.'));
      }
    });
  }

  private broadcastEdit(content: string) {
    const sessionId = this.collabSessionId();
    const file = this.selectedFile();
    if (!sessionId || !file || !this.collabClient || !this.collabClient.connected) return;
    this.collabClient.publish({
      destination: `/app/session.${sessionId}.edit`,
      headers: { 'X-User-Id': String(this.api.user()?.userId || '') },
      body: JSON.stringify({
        fileId: file.fileId,
        path: file.path,
        content,
        userId: this.api.user()?.userId
      })
    });
  }

  private applyRemoteEdit(message: IMessage) {
    try {
      const payload = JSON.parse(message.body);
      const nextContent = payload?.content ?? payload?.sourceCode ?? payload?.code;
      if (typeof nextContent !== 'string') return;
      if (nextContent === this.editorValue) return;
      this.suppressCollabBroadcast = true;
      this.editorValue = nextContent;
      this.suppressCollabBroadcast = false;
    } catch {
      return;
    }
  }

  private readTextMessage(message: IMessage) {
    try {
      const payload = JSON.parse(message.body);
      if (typeof payload === 'string') return payload;
      return payload?.message || payload?.event || 'Session update';
    } catch {
      return message.body || 'Session update';
    }
  }

  private pushCollabEvent(text: string) {
    this.collabEvents.update((items) => [text, ...items].slice(0, 8));
  }

  private readSessionId(session: any) {
    const raw = session?.sessionId ?? session?.id ?? session?.code;
    return raw == null ? '' : String(raw);
  }

  onFileLanguageChange(language: string) {
    this.fileForm.language = language;
    this.fileForm.path = this.defaultPathForLanguage(language);
    this.fileForm.name = this.fileForm.path.split('/').pop() || this.fileForm.name;
    this.fileForm.content = this.templateForLanguage(language);
  }

  private applyTemplateFromLanguage() {
    this.fileForm.content = this.templateForLanguage(this.fileForm.language);
  }

  private defaultPathForLanguage(language: string) {
    const key = this.normalizeLanguage(language);
    const map: Record<string, string> = {
      java: 'src/Main.java',
      python: 'src/main.py',
      javascript: 'src/index.js',
      typescript: 'src/index.ts',
      'c++': 'src/main.cpp',
      c: 'src/main.c',
      go: 'src/main.go',
      rust: 'src/main.rs',
      ruby: 'src/main.rb',
      php: 'src/index.php'
    };
    return map[key] || 'src/main.txt';
  }

  private templateForLanguage(language: string) {
    const key = this.normalizeLanguage(language);
    const templates: Record<string, string> = {
      java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello CodeSync");\n  }\n}\n',
      python: 'def main():\n    print("Hello CodeSync")\n\n\nif __name__ == "__main__":\n    main()\n',
      javascript: 'function main() {\n  console.log("Hello CodeSync");\n}\n\nmain();\n',
      typescript: 'function main(): void {\n  console.log("Hello CodeSync");\n}\n\nmain();\n',
      'c++': '#include <iostream>\n\nint main() {\n  std::cout << "Hello CodeSync" << std::endl;\n  return 0;\n}\n',
      c: '#include <stdio.h>\n\nint main(void) {\n  printf("Hello CodeSync\\n");\n  return 0;\n}\n',
      go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello CodeSync")\n}\n',
      rust: 'fn main() {\n    println!("Hello CodeSync");\n}\n',
      ruby: 'puts "Hello CodeSync"\n',
      php: '<?php\n\necho "Hello CodeSync\\n";\n'
    };
    return templates[key] || '';
  }

  private normalizeLanguage(language: string) {
    return (language || '').trim().toLowerCase();
  }

  private errorMessage(err: any, fallback: string) {
    if (typeof err?.error === 'string' && err.error.trim()) return err.error;
    if (err?.error?.message) return err.error.message;
    if (err?.status === 401) return 'Unauthorized. Please login again.';
    if (err?.status === 404) return 'Service route not found. Check API Gateway and service registration.';
    if (err?.status >= 500) return 'Backend server error. Check service logs.';
    return fallback;
  }
}
