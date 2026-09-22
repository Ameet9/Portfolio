import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService, Job } from './job.service';
import { noFutureDateValidator } from './no-future-date.validator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1>JobHunt Tracker</h1>
      
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h2>Add a New Job</h2>
        <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold;">Company:</label>
            <input formControlName="company" type="text" style="width: 100%; padding: 8px;" />
            <div *ngIf="jobForm.get('company')?.invalid && jobForm.get('company')?.touched" style="color: red; font-size: 0.9em; margin-top: 5px;">
              Company is required (min 2 chars).
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold;">Role:</label>
            <input formControlName="role" type="text" style="width: 100%; padding: 8px;" />
            <div *ngIf="jobForm.get('role')?.invalid && jobForm.get('role')?.touched" style="color: red; font-size: 0.9em; margin-top: 5px;">
              Role is required.
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold;">Status:</label>
            <select formControlName="status" style="width: 100%; padding: 8px;">
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold;">Applied Date:</label>
            <input formControlName="appliedDate" type="date" style="width: 100%; padding: 8px;" />
            <div *ngIf="jobForm.get('appliedDate')?.hasError('required') && jobForm.get('appliedDate')?.touched" style="color: red; font-size: 0.9em; margin-top: 5px;">
              Applied Date is required.
            </div>
            <div *ngIf="jobForm.get('appliedDate')?.hasError('futureDate') && jobForm.get('appliedDate')?.touched" style="color: red; font-size: 0.9em; margin-top: 5px;">
              Applied Date cannot be in the future.
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold;">Notes:</label>
            <textarea formControlName="notes" rows="3" style="width: 100%; padding: 8px;"></textarea>
          </div>

          <button type="submit" [disabled]="jobForm.invalid || isLoading" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            {{ isLoading ? 'Saving...' : 'Add Job' }}
          </button>
        </form>
      </div>

      <div>
        <h2>Tracked Jobs</h2>
        <div *ngIf="isLoadingList" style="color: #666; font-style: italic;">Loading jobs...</div>
        
        <table *ngIf="!isLoadingList" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f8f9fa; text-align: left;">
              <th style="padding: 10px; border: 1px solid #ddd;">Company</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Role</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Applied Date</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="jobs.length === 0">
              <td colspan="5" style="padding: 20px; text-align: center; border: 1px solid #ddd;">No jobs tracked yet.</td>
            </tr>
            <tr *ngFor="let job of jobs">
              <td style="padding: 10px; border: 1px solid #ddd;">{{ job.company }}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">{{ job.role }}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <span [ngStyle]="{
                  'padding': '4px 8px', 
                  'border-radius': '4px',
                  'font-size': '0.9em',
                  'background-color': getStatusColor(job.status)
                }">
                  {{ job.status }}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #ddd;">{{ job.appliedDate }}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">{{ job.notes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  jobForm: FormGroup;
  jobs: Job[] = [];
  isLoading = false;
  isLoadingList = false;

  constructor(private fb: FormBuilder, private jobService: JobService) {
    this.jobForm = this.fb.group({
      company: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      status: ['Applied', Validators.required],
      appliedDate: ['', [Validators.required, noFutureDateValidator()]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoadingList = true;
    this.jobService.getJobs().subscribe((data) => {
      this.jobs = data;
      this.isLoadingList = false;
    });
  }

  onSubmit() {
    if (this.jobForm.valid) {
      this.isLoading = true;
      const newJob: Job = this.jobForm.value;
      
      this.jobService.addJob(newJob).subscribe({
        next: (addedJob) => {
          this.jobs.push(addedJob);
          this.jobForm.reset({ status: 'Applied' });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to add job', err);
          this.isLoading = false;
        }
      });
    } else {
      this.jobForm.markAllAsTouched();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Applied': return '#e2e3e5';
      case 'Interviewing': return '#fff3cd';
      case 'Offer': return '#d1e7dd';
      case 'Rejected': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }
}
