import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  constructor() {}

  login(): void {
    console.log('[AuthService] Logging in... saving mock expired token.');
    this.setToken('short_lived_token_123');
    this.setRefreshToken('refresh_token_456');
  }

  logout(): void {
    console.log('[AuthService] Logging out...');
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  // Simulate token refresh API call
  refreshToken(): Observable<{ accessToken: string, refreshToken: string }> {
    console.log('[AuthService] Calling refresh token endpoint...');
    return of({
      accessToken: `new_access_token_${Math.random()}`,
      refreshToken: `new_refresh_token_${Math.random()}`
    }).pipe(
      delay(1500), // Simulate network delay for the API call
      tap(response => {
        console.log('[AuthService] Token refresh successful.');
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      })
    );
  }
}
