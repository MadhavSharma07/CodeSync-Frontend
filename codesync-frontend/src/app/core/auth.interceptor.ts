import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('codesync.accessToken');
  const user = localStorage.getItem('codesync.user');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed?.userId) {
        headers['X-User-Id'] = String(parsed.userId);
      }
    } catch {
      localStorage.removeItem('codesync.user');
    }
  }

  return next(Object.keys(headers).length ? req.clone({ setHeaders: headers }) : req);
};
