import { HttpRequest, HttpResponse } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { Observable, of } from 'rxjs';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('adds Authorization and X-User-Id headers when session exists', (done) => {
    localStorage.setItem('codesync.accessToken', 'token-1');
    localStorage.setItem('codesync.user', JSON.stringify({ userId: 42 }));

    const req = new HttpRequest('GET', '/api/demo');
    authInterceptor(req, (nextReq): Observable<HttpResponse<unknown>> => {
      expect(nextReq.headers.get('Authorization')).toBe('Bearer token-1');
      expect(nextReq.headers.get('X-User-Id')).toBe('42');
      return of(new HttpResponse({ status: 200 }));
    }).subscribe(() => done());
  });

  it('removes corrupted user payload from local storage', (done) => {
    localStorage.setItem('codesync.user', '{ broken json');

    const req = new HttpRequest('GET', '/api/demo');
    authInterceptor(req, (nextReq): Observable<HttpResponse<unknown>> => {
      expect(nextReq.headers.has('X-User-Id')).toBeFalse();
      return of(new HttpResponse({ status: 200 }));
    }).subscribe(() => {
      expect(localStorage.getItem('codesync.user')).toBeNull();
      done();
    });
  });
});
