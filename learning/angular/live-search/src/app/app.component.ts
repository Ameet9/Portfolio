import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap, takeUntil } from 'rxjs/operators';
import { SearchService, GitHubUser } from './search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>GitHub User Search</h1>
      
      <div class="search-box">
        <input 
          type="text" 
          [formControl]="searchControl" 
          placeholder="Search GitHub users..."
          class="search-input"
        >
        <div *ngIf="isLoading" class="spinner">Searching...</div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && users.length === 0 && (searchControl.value || '').trim().length > 0 && !errorMessage" class="empty-state">
        No users found for "{{ searchControl.value }}".
      </div>

      <ul class="user-list" *ngIf="users.length > 0">
        <li *ngFor="let user of users" class="user-item">
          <img [src]="user.avatar_url" alt="avatar" class="avatar">
          <div class="user-info">
            <a [href]="user.html_url" target="_blank">{{ user.login }}</a>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 3rem auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { margin-top: 0; color: #333; }
    .search-box { position: relative; display: flex; align-items: center; margin-bottom: 1.5rem; }
    .search-input { width: 100%; padding: 0.8rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
    .search-input:focus { outline: none; border-color: #0366d6; box-shadow: 0 0 0 3px rgba(3,102,214,0.3); }
    .spinner { position: absolute; right: 15px; font-size: 0.85rem; color: #666; font-style: italic; }
    .error-message { color: #d73a49; margin-bottom: 1rem; padding: 1rem; background: #ffeef0; border: 1px solid #d73a49; border-radius: 6px; }
    .empty-state { color: #666; font-style: italic; text-align: center; padding: 2rem 0; }
    .user-list { list-style: none; padding: 0; margin: 0; }
    .user-item { display: flex; align-items: center; padding: 1rem; border: 1px solid #e1e4e8; margin-bottom: 0.5rem; border-radius: 6px; transition: background-color 0.2s; }
    .user-item:hover { background-color: #f6f8fa; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; margin-right: 1.2rem; }
    .user-info a { color: #0366d6; text-decoration: none; font-weight: 600; font-size: 1.1rem; }
    .user-info a:hover { text-decoration: underline; }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  users: GitHubUser[] = [];
  isLoading = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      // 1. Reset error state on new keystrokes
      tap(() => this.errorMessage = ''),
      // 2. Sanitize and trim
      map(value => (value || '').trim()),
      // 3. Clear results immediately if query is empty
      tap(query => {
        if (!query) {
          this.users = [];
          this.isLoading = false;
        }
      }),
      // 4. Only proceed if there is an actual query string
      filter(query => query.length > 0),
      // 5. Wait 300ms after the last keystroke before considering the term
      debounceTime(300),
      // 6. Ensure we don't repeat the exact same search as the previous one
      distinctUntilChanged(),
      // 7. Show loading spinner just before executing the API call
      tap(() => this.isLoading = true),
      // 8. switchMap automatically cancels the previous HTTP request if a new one triggers
      switchMap(query => 
        this.searchService.searchUsers(query).pipe(
          catchError(error => {
            this.errorMessage = 'Failed to load users. You might have hit the GitHub API rate limit.';
            return of([]); // Return an empty array so the outer observable doesn't die
          })
        )
      )
    ).subscribe((results: GitHubUser[]) => {
      this.users = results;
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
