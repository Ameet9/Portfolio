import { HttpInterceptorFn } from '@angular/common/http';
import { finalize, tap } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`[LoadingInterceptor] Outgoing Request to ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event) => console.log(`[LoadingInterceptor] Response Event:`, event),
      error: (error) => console.error(`[LoadingInterceptor] Error:`, error)
    }),
    finalize(() => {
      console.log(`[LoadingInterceptor] Request finished for ${req.url}`);
    })
  );
};
