import { provideRouter, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiService, CodeSyncUser } from './api.service';
import { adminGuard, authGuard, guestGuard } from './auth.guard';
import { CanActivateFn } from '@angular/router';

class ApiServiceStub {
  user = signal<CodeSyncUser | null>(null);
}

describe('auth guards', () => {
  let apiStub: ApiServiceStub;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useClass: ApiServiceStub }, provideRouter([])]
    });

    apiStub = TestBed.inject(ApiService) as unknown as ApiServiceStub;
    router = TestBed.inject(Router);
  });

  function runGuard(guard: CanActivateFn): boolean | UrlTree {
    return TestBed.runInInjectionContext(() => guard({} as never, {} as never) as boolean | UrlTree);
  }

  it('authGuard redirects to login when user is missing', () => {
    const result = runGuard(authGuard);
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });

  it('authGuard allows when user is present', () => {
    apiStub.user.set({ userId: 1, username: 'u', email: 'u@u.com', fullName: 'U', role: 'DEVELOPER' });
    expect(runGuard(authGuard)).toBeTrue();
  });

  it('guestGuard redirects logged-in user to dashboard', () => {
    apiStub.user.set({ userId: 1, username: 'u', email: 'u@u.com', fullName: 'U', role: 'DEVELOPER' });
    const result = runGuard(guestGuard);
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('adminGuard blocks non-admin user', () => {
    apiStub.user.set({ userId: 1, username: 'u', email: 'u@u.com', fullName: 'U', role: 'DEVELOPER' });
    const result = runGuard(adminGuard);
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });
});
