import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'https://api.github.com/search/users';

  constructor(private http: HttpClient) {}

  /**
   * Searches GitHub users by query string.
   * @param query The search term
   * @returns An Observable emitting an array of GitHubUser
   */
  searchUsers(query: string): Observable<GitHubUser[]> {
    return this.http.get<GitHubSearchResponse>(`${this.apiUrl}?q=${encodeURIComponent(query)}`).pipe(
      map(response => response.items)
    );
  }
}
