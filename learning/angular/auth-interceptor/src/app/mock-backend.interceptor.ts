import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/protected')) {
    const authHeader = req.headers.get('Authorization');
    console.log(`[MockBackend] Intercepted ${req.url} - Auth: ${authHeader}`);
    
    // Simulate expired token failure
    if (authHeader === 'Bearer short_lived_token_123') {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: req.url,
        error: { message: 'Token is expired' }
      })).pipe(delay(500));
    } 
    // Simulate valid refreshed token success
    else if (authHeader && authHeader.startsWith('Bearer new_access_token_')) {
      return of(new HttpResponse({ status: 200, body: { message: `Success for ${req.url}` } })).pipe(delay(500));
    } 
    // Missing or invalid
    else {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: req.url,
        error: { message: 'No token provided' }
      })).pipe(delay(500));
    }
  }
  
  return next(req);
};
