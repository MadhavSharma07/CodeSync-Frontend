import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService, API_BASE, CodeSyncUser } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const mockUser: CodeSyncUser = {
    userId: 7,
    username: 'madhav',
    email: 'madhav@gmail.com',
    fullName: 'Madhav',
    role: 'DEVELOPER'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores session on login', () => {
    service.login({ email: 'madhav@gmail.com', password: 'secret' }).subscribe((res) => {
      expect(res.user.username).toBe('madhav');
      expect(localStorage.getItem('codesync.accessToken')).toBe('access-1');
      expect(localStorage.getItem('codesync.refreshToken')).toBe('refresh-1');
      expect(service.user()?.userId).toBe(7);
    });

    const req = httpMock.expectOne(`${API_BASE}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'access-1', refreshToken: 'refresh-1', user: mockUser });
  });

  it('clears session data', () => {
    localStorage.setItem('codesync.accessToken', 't1');
    localStorage.setItem('codesync.refreshToken', 't2');
    localStorage.setItem('codesync.user', JSON.stringify(mockUser));
    service.user.set(mockUser);

    service.clearSession();

    expect(localStorage.getItem('codesync.accessToken')).toBeNull();
    expect(localStorage.getItem('codesync.refreshToken')).toBeNull();
    expect(localStorage.getItem('codesync.user')).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('sends X-User-Id header for collab requests', () => {
    service.user.set(mockUser);

    service
      .createSession({ projectId: 1, fileId: 2, language: 'Java', maxParticipants: 3, passwordProtected: false, password: '' })
      .subscribe();

    const req = httpMock.expectOne(`${API_BASE}/sessions`);
    expect(req.request.headers.get('X-User-Id')).toBe('7');
    req.flush({});
  });
});
