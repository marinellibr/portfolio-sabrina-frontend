import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { Post, ProjectPostImage } from '../../models/post.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private imageRotationTimer: ReturnType<typeof setInterval> | null = null;

  posts = signal<Post[]>([]);
  error = signal<string | null>(null);
  getPostsError = signal<string | null>(null);
  success = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  loadingPosts = signal(false);
  imageRotationIndex = signal(0);

  ngOnInit(): void {
    this.loadPosts();
    this.imageRotationTimer = setInterval(() => {
      this.imageRotationIndex.update((index) => index + 1);
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.imageRotationTimer) {
      clearInterval(this.imageRotationTimer);
    }
  }

  loadPosts(): void {
    this.loadingPosts.set(true);
    this.getPostsError.set(null);
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loadingPosts.set(false);
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.getPostsError.set(err.error?.message || 'Erro ao carregar posts');
        this.loadingPosts.set(false);
      },
    });
  }

  getPostCardImage(post: Post, index: number): string {
    const images = this.getCardImages(post);
    if (!images.length) return '';

    return images[(this.imageRotationIndex() + index) % images.length];
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

  private getCardImages(post: Post): string[] {
    const images = new Set<string>();

    if (post.coverImage) {
      images.add(post.coverImage);
    }

    if (!Array.isArray(post.images)) return [...images];

    post.images
      .filter((image): image is ProjectPostImage => typeof image !== 'string' && image.cover)
      .map((image) => image.url)
      .filter(Boolean)
      .forEach((image) => images.add(image));

    return [...images];
  }
}
