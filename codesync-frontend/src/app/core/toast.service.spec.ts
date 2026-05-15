import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('shows message immediately and clears after timeout', (done) => {
    service.show('Saved successfully');
    expect(service.message()).toBe('Saved successfully');

    window.setTimeout(() => {
      expect(service.message()).toBe('');
      done();
    }, 3600);
  });
});
