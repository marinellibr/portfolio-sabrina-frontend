import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostSummary } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://portfolio-sabrina-backend.vercel.app/posts';

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }

  getPostsSummary(): Observable<PostSummary[]> {
    return this.http.get<PostSummary[]>(`${this.baseUrl}/summary`);
  }
}
