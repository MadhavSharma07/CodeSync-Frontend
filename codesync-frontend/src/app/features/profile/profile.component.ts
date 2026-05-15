import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  form = { username: '', fullName: '', bio: '', avatarUrl: '' };

  constructor(public api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    const user = this.api.user();
    if (!user) return;
    this.form = {
      username: user.username,
      fullName: user.fullName,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    };
  }

  save() {
    this.api.updateProfile(this.form).subscribe({
      next: () => this.toast.show('Profile updated'),
      error: () => this.toast.show('Profile update failed')
    });
  }
}
