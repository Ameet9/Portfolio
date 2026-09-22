import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface Job {
  id?: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private mockJobs: Job[] = [];

  constructor(private http: HttpClient) {}

  // Mocking GET request
  getJobs(): Observable<Job[]> {
    // In a real app, this would be: return this.http.get<Job[]>('/api/jobs');
    // Using http.get to trigger the interceptor, even though it's a dummy endpoint
    this.http.get('/api/dummy').subscribe({ error: () => {} });
    
    return of([...this.mockJobs]).pipe(
      delay(800) // Simulate network delay
    );
  }

  // Mocking POST request
  addJob(job: Job): Observable<Job> {
    const newJob = { ...job, id: Math.random().toString(36).substring(2, 9) };
    this.mockJobs.push(newJob);
    
    // Using http.post to trigger the interceptor
    this.http.post('/api/dummy', {}).subscribe({ error: () => {} });

    return of(newJob).pipe(
      delay(800) // Simulate network delay
    );
  }
}
