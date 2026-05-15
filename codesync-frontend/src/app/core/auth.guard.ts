import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  return api.user() ? true : router.createUrlTree(['/auth/login']);
};

export const guestGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  return api.user() ? router.createUrlTree(['/dashboard']) : true;
};

export const adminGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  return api.user()?.role === 'ADMIN' ? true : router.createUrlTree(['/dashboard']);
};
