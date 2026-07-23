import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImageSelectionComponent } from '../../components/image-selection/image-selection.component';
import { ProjectPostImage } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { CreatePostRequest, PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ImageSelectionComponent],
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss'],
})
export class PostEditorComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form: FormGroup;
  postId = signal<string | null>(null);
  loading = signal(false);
  loadingPost = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  selectedImageFiles = signal<ProjectPostImage[]>([]);

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.maxLength(20000)]],
      coverImage: [''],
      video: [''],
      tags: [''],
      year: [''],
      projectType: [''],
      button: this.fb.group({
        label: [''],
        link: [''],
      }),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.postId.set(id);
    this.loadingPost.set(true);

    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.form.patchValue({
          title: post.title,
          content: post.content,
          coverImage: post.coverImage || '',
          video: post.video || post.videos?.[0] || '',
          tags: (post.categories || post.tags || []).join(', '),
          year: post.year || '',
          projectType: Array.isArray(post.projectType) ? post.projectType.join(', ') : post.projectType || '',
          button: {
            label: post.button?.label || '',
            link: post.button?.link || '',
          },
        });
        this.selectedImageFiles.set(this.getPostImages(post.images));
        this.loadingPost.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar post');
        this.loadingPost.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const postData: CreatePostRequest = {
      coverImage: this.parseOptionalText(formValue.coverImage),
      title: formValue.title,
      content: formValue.content,
      button: this.parseButton(formValue.button),
      categories: this.parseList(formValue.tags),
      year: this.parseOptionalText(formValue.year),
      projectType: this.parseList(formValue.projectType),
      images: this.selectedImageFiles(),
      video: this.parseOptionalText(formValue.video),
    };

    const request = this.postId()
      ? this.postService.updatePost(this.postId()!, postData)
      : this.postService.createPost(postData);

    request.subscribe({
      next: () => {
        this.success.set(this.postId() ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/admin']), 900);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao salvar post');
        this.loading.set(false);
      },
    });
  }

  onImageSelectionChange(images: ProjectPostImage[]): void {
    this.selectedImageFiles.set(images);
  }

  logSelectedImageFiles(): void {
    console.log(this.selectedImageFiles());
  }

  logout(): void {
    this.authService.logout();
  }

  private parseList(value: string): string[] {
    if (!value || !value.trim()) return [];
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseButton(value: { label?: string; link?: string } | null): CreatePostRequest["button"] {
    const label = value?.label?.trim();
    const link = value?.link?.trim();

    return {
      label: label || '',
      link: link || '',
    };
  }

  private parseOptionalText(value: string): string {
    const trimmedValue = value?.trim();
    return trimmedValue || '';
  }

  private getPostImages(images: unknown): ProjectPostImage[] {
    if (!Array.isArray(images)) return [];

    return images
      .map((image) => {
        if (typeof image === 'string') {
          return {
            url: image,
            cover: false,
          };
        }

        const projectImage = image as ProjectPostImage;
        return {
          url: projectImage.url,
          cover: projectImage.cover,
        };
      })
      .filter((image) => image.url);
  }
}
