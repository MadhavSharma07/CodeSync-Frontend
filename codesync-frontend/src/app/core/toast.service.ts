import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');

  show(text: string) {
    this.message.set(text);
    window.setTimeout(() => this.message.set(''), 3500);
  }
}
