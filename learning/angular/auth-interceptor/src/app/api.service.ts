import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  fetchProtectedData(requestId: number): Observable<any> {
    // This will be intercepted by our mockBackendInterceptor
    return this.http.get(`/api/protected/data?id=${requestId}`);
  }
}
