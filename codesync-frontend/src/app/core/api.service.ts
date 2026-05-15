import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

export const API_BASE = 'http://localhost:8080/api/v1';

export interface CodeSyncUser {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'DEVELOPER' | 'ADMIN';
  avatarUrl?: string;
  bio?: string;
  provider?: string;
  isActive?: boolean;
}

export interface Project {
  projectId: number;
  ownerId: number;
  name: string;
  description: string;
  language: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  starCount?: number;
  forkCount?: number;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CodeFile {
  fileId: number;
  projectId: number;
  name: string;
  path: string;
  language: string;
  content?: string;
  folder?: boolean;
  isFolder?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionJob {
  jobId: string;
  projectId: number;
  fileId: number;
  userId: number;
  language: string;
  status: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  createdAt?: string;
}

export interface Snapshot {
  snapshotId: number;
  projectId: number;
  fileId: number;
  authorId: number;
  message: string;
  content: string;
  branch: string;
  tag?: string;
  hash?: string;
  createdAt?: string;
}

export interface ReviewComment {
  commentId: number;
  projectId: number;
  fileId: number;
  authorId: number;
  content: string;
  lineNumber: number;
  columnNumber?: number;
  parentCommentId?: number;
  resolved: boolean;
  snapshotId?: number;
  createdAt?: string;
}

export interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string | number;
  relatedType?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  user = signal<CodeSyncUser | null>(this.restoreUser());

  constructor(private http: HttpClient) {}

  register(body: { username: string; email: string; password: string; fullName: string }) {
    return this.http.post<{ message: string; user: CodeSyncUser }>(`${API_BASE}/auth/register`, body);
  }

  login(body: { email: string; password: string }) {
    return this.http.post<{ accessToken: string; refreshToken: string; user: CodeSyncUser }>(`${API_BASE}/auth/login`, body).pipe(
      tap((res) => {
        localStorage.setItem('codesync.accessToken', res.accessToken);
        localStorage.setItem('codesync.refreshToken', res.refreshToken);
        localStorage.setItem('codesync.user', JSON.stringify(res.user));
        this.user.set(res.user);
      })
    );
  }

  logout() {
    return this.http.post(`${API_BASE}/auth/logout`, {}).pipe(tap(() => this.clearSession()));
  }

  hasSession() {
    return Boolean(localStorage.getItem('codesync.accessToken'));
  }

  clearSession() {
    localStorage.removeItem('codesync.accessToken');
    localStorage.removeItem('codesync.refreshToken');
    localStorage.removeItem('codesync.user');
    this.user.set(null);
  }

  profile() {
    return this.http.get<CodeSyncUser>(`${API_BASE}/auth/profile`).pipe(tap((user) => {
      localStorage.setItem('codesync.user', JSON.stringify(user));
      this.user.set(user);
    }));
  }

  updateProfile(body: Partial<CodeSyncUser>) {
    return this.http.put<CodeSyncUser>(`${API_BASE}/auth/profile`, body).pipe(tap((user) => {
      localStorage.setItem('codesync.user', JSON.stringify(user));
      this.user.set(user);
    }));
  }

  publicProjects() {
    return this.http.get<Project[]>(`${API_BASE}/projects/public`);
  }

  searchProjects(q: string) {
    return this.http.get<Project[]>(`${API_BASE}/projects/search`, { params: new HttpParams().set('q', q) });
  }

  myProjects(userId: number) {
    return this.http.get<Project[]>(`${API_BASE}/projects/owner/${userId}`);
  }

  createProject(body: Partial<Project>) {
    return this.http.post<Project>(`${API_BASE}/projects`, body);
  }

  forkProject(projectId: number) {
    return this.http.post<Project>(`${API_BASE}/projects/${projectId}/fork`, {});
  }

  starProject(projectId: number) {
    return this.http.post<Project>(`${API_BASE}/projects/${projectId}/star`, {});
  }

  getFiles(projectId: number) {
    return this.http.get<CodeFile[]>(`${API_BASE}/files/project/${projectId}/tree`);
  }

  createFile(body: Partial<CodeFile>) {
    return this.http.post<CodeFile>(`${API_BASE}/files`, body);
  }

  createFolder(body: Partial<CodeFile>) {
    return this.http.post<CodeFile>(`${API_BASE}/files/folder`, body);
  }

  fileContent(fileId: number) {
    return this.http.get<{ content: string }>(`${API_BASE}/files/${fileId}/content`);
  }

  saveFile(fileId: number, content: string) {
    return this.http.put<CodeFile>(`${API_BASE}/files/${fileId}/content`, { content });
  }

  runCode(body: { projectId: number; fileId: number; language: string; sourceCode: string; stdin: string }) {
    return this.http.post<ExecutionJob>(`${API_BASE}/executions`, body);
  }

  job(jobId: string) {
    return this.http.get<ExecutionJob>(`${API_BASE}/executions/${jobId}`);
  }

  jobsByProject(projectId: number) {
    return this.http.get<ExecutionJob[]>(`${API_BASE}/executions/project/${projectId}`);
  }

  languages() {
    return this.http.get<string[]>(`${API_BASE}/executions/languages`);
  }

  snapshots(fileId: number) {
    return this.http.get<Snapshot[]>(`${API_BASE}/versions/file/${fileId}/history`);
  }

  createSnapshot(body: { projectId: number; fileId: number; message: string; content: string; branch: string }) {
    return this.http.post<Snapshot>(`${API_BASE}/versions`, body);
  }

  diff(a: number, b: number) {
    return this.http.get<Array<Record<string, unknown>>>(`${API_BASE}/versions/diff`, {
      params: new HttpParams().set('a', a).set('b', b)
    });
  }

  comments(fileId: number) {
    return this.http.get<ReviewComment[]>(`${API_BASE}/comments/file/${fileId}`);
  }

  addComment(body: Partial<ReviewComment>) {
    return this.http.post<ReviewComment>(`${API_BASE}/comments`, body);
  }

  toggleComment(comment: ReviewComment) {
    return this.http.put<ReviewComment>(`${API_BASE}/comments/${comment.commentId}/${comment.resolved ? 'unresolve' : 'resolve'}`, {});
  }

  notifications() {
    return this.http.get<NotificationItem[]>(`${API_BASE}/notifications`);
  }

  unreadNotifications() {
    return this.http.get<NotificationItem[]>(`${API_BASE}/notifications/unread`);
  }

  notificationBadge() {
    return this.http.get<{ unreadCount: number }>(`${API_BASE}/notifications/badge`);
  }

  markRead(notificationId: number) {
    return this.http.put(`${API_BASE}/notifications/${notificationId}/read`, {});
  }

  markAllRead() {
    return this.http.put(`${API_BASE}/notifications/read-all`, {});
  }

  clearReadNotifications() {
    return this.http.delete(`${API_BASE}/notifications/read`);
  }

  createSession(body: { projectId: number; fileId: number; language: string; maxParticipants: number; passwordProtected: boolean; password: string }) {
    return this.http.post(`${API_BASE}/sessions`, body, { headers: this.userHeader() });
  }

  joinSession(sessionId: string) {
    return this.http.post(`${API_BASE}/sessions/${sessionId}/join`, {}, { headers: this.userHeader() });
  }

  leaveSession(sessionId: string) {
    return this.http.post(`${API_BASE}/sessions/${sessionId}/leave`, {}, { headers: this.userHeader() });
  }

  allUsers() {
    return this.http.get<CodeSyncUser[]>(`${API_BASE}/auth/admin/users`);
  }

  broadcast(body: { recipientIds: number[]; title: string; message: string; deepLinkUrl: string }) {
    return this.http.post(`${API_BASE}/notifications/broadcast`, body);
  }

  private restoreUser() {
    try {
      return JSON.parse(localStorage.getItem('codesync.user') || 'null') as CodeSyncUser | null;
    } catch {
      return null;
    }
  }

  private userHeader() {
    const userId = this.user()?.userId;
    return new HttpHeaders(userId ? { 'X-User-Id': String(userId) } : {});
  }
}
