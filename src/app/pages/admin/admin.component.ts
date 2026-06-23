import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService, CreatePostRequest } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private readonly fb = inject(FormBuilder);

  posts = signal<Post[]>([]);
  form: FormGroup;
  editingId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showForm = signal(false);
  deletingId = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.maxLength(20000)]],
      images: [''],
      videos: [''],
      tags: [''],
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe({
      next: (posts) => this.posts.set(posts),
      error: (err) => console.error('Error loading posts:', err),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const postData: CreatePostRequest = {
      title: formValue.title,
      content: formValue.content,
      images: this.parseArray(formValue.images),
      videos: this.parseArray(formValue.videos),
      tags: this.parseArray(formValue.tags),
    };

    const request = this.editingId()
      ? this.postService.updatePost(this.editingId()!, postData)
      : this.postService.createPost(postData);

    request.subscribe({
      next: () => {
        this.success.set(
          this.editingId() ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!'
        );
        this.resetForm();
        this.loadPosts();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao salvar post');
        this.loading.set(false);
      },
    });
  }

  editPost(post: Post): void {
    this.form.patchValue({
      title: post.title,
      content: post.content,
      images: post.images?.join('\n') || '',
      videos: post.videos?.join('\n') || '',
      tags: post.tags?.join(', ') || '',
    });
    this.editingId.set(post._id);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  resetForm(): void {
    this.form.reset();
    this.editingId.set(null);
    this.showForm.set(false);
    this.loading.set(false);
  }

  private parseArray(value: string): string[] | undefined {
    if (!value || !value.trim()) return undefined;
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item && this.isValidUrl(item));
  }

  private isValidUrl(url: string): boolean {
    return /^https?:\/\//.test(url) || /^[a-zA-Z0-9\s-]+$/.test(url);
  }

  logout(): void {
    this.authService.logout();
  }
}
