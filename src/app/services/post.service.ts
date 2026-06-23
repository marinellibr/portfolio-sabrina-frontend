import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostSummary } from '../models/post.model';

export interface CreatePostRequest {
  title: string;
  content: string;
  images?: string[];
  videos?: string[];
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://portfolio-sabrina-backend.vercel.app/posts';

  // Public routes
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }

  getPostsSummary(): Observable<PostSummary[]> {
    return this.http.get<PostSummary[]>(`${this.baseUrl}/summary`);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`);
  }

  // Protected routes (require JWT)
  createPost(post: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, post);
  }

  updatePost(id: string, post: CreatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, post);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
