import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
      <h2>Angular Auto-Refreshing Auth Interceptor</h2>
      <p>Demonstrates concurrent 401 handling using RxJS.</p>
      
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <button (click)="login()" style="padding: 10px; cursor: pointer;">1. Login (Sets Expired Token)</button>
        <button (click)="fetchData()" style="padding: 10px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">2. Fetch Data (Fire 3 simultaneous requests)</button>
        <button (click)="logout()" style="padding: 10px; cursor: pointer;">Logout</button>
      </div>

      <div style="border: 1px solid #ccc; background: #1e1e1e; color: #fff; border-radius: 4px;">
        <div style="padding: 10px; border-bottom: 1px solid #444; background: #333; display: flex; justify-content: space-between;">
          <b>Console Logs</b>
          <button (click)="clearLogs()" style="font-size: 12px; cursor: pointer;">Clear Logs</button>
        </div>
        <pre style="padding: 15px; margin: 0; white-space: pre-wrap; font-size: 14px; max-height: 400px; overflow-y: auto;">{{ logs.join('\\n') }}</pre>
      </div>
    </div>
  `
})
export class AppComponent {
  logs: string[] = [];

  constructor(private authService: AuthService, private apiService: ApiService) {
    // Intercept console.log to show on UI
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      this.logs.push(args.join(' '));
      originalLog.apply(console, args);
    };
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  clearLogs() {
    this.logs = [];
  }

  fetchData() {
    console.log('\\n--- Firing 3 simultaneous API requests ---');
    for (let i = 1; i <= 3; i++) {
      this.apiService.fetchProtectedData(i).subscribe({
        next: (res) => console.log(`✅ Request ${i} success:`, JSON.stringify(res)),
        error: (err) => console.log(`❌ Request ${i} final error:`, err.message)
      });
    }
  }
}
