import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth.guard';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExploreComponent } from './features/explore/explore.component';
import { WorkspaceComponent } from './features/workspace/workspace.component';
import { WorkspaceCreateComponent } from './features/workspace-create/workspace-create.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: AuthPageComponent, canActivate: [guestGuard] },
  { path: 'auth/register', component: AuthPageComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'explore', component: ExploreComponent, canActivate: [authGuard] },
  { path: 'workspace', pathMatch: 'full', redirectTo: 'workspace/create' },
  { path: 'workspace/create', component: WorkspaceCreateComponent, canActivate: [authGuard] },
  { path: 'workspace/studio', component: WorkspaceComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'auth/login' }
];
