import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);

  posts = signal<Post[]>([]);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  deletingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe({
      next: (posts) => this.posts.set(posts),
      error: (err) => console.error('Error loading posts:', err),
    });
  }

  deletePost(id: string): void {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;

    this.deletingId.set(id);
    this.postService.deletePost(id).subscribe({
      next: () => {
        this.success.set('Post deletado com sucesso!');
        this.loadPosts();
        this.deletingId.set(null);
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao deletar post');
        this.deletingId.set(null);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
