import { HttpInterceptorFn, HttpRequest, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, switchMap, take, throwError, BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Global state for the interceptor to track refresh status
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Attach token to the outgoing request if it exists
  let authReq = req;
  if (token) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      // If we receive a 401 error, we need to refresh the token
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

function handle401Error(request: HttpRequest<any>, next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>, authService: AuthService) {
  if (!isRefreshing) {
    // Scenario 1: We are the FIRST request to fail. 
    // We lock the refresh process and start the token refresh.
    isRefreshing = true;
    refreshTokenSubject.next(null); // Reset subject

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.accessToken); // Notify queued requests
        
        // Retry the original request with the new token
        return next(addTokenHeader(request, tokenResponse.accessToken));
      }),
      catchError((err) => {
        // If the refresh token call fails, logout the user
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Scenario 2: A token refresh is currently in progress.
    // We queue this request by waiting for the refreshTokenSubject to emit a valid token.
    return refreshTokenSubject.pipe(
      filter(token => token !== null), // Wait until token is not null
      take(1), // Complete after taking the first valid token so we don't leak
      switchMap(token => {
        // Retry the queued request with the new token
        return next(addTokenHeader(request, token as string));
      })
    );
  }
}
