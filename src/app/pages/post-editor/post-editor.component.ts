import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ImageSelectionComponent } from "../../components/image-selection/image-selection.component";
import { ProjectPostImage } from "../../models/post.model";
import { AuthService } from "../../services/auth.service";
import { CreatePostRequest, PostService } from "../../services/post.service";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

@Component({
  selector: "app-post-editor",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ImageSelectionComponent,
  ],
  templateUrl: "./post-editor.component.html",
  styleUrls: ["./post-editor.component.scss"],
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
      title: ["", [Validators.required, Validators.maxLength(200)]],
      titleEn: ["", [Validators.required, Validators.maxLength(200)]],
      description: ["", [Validators.required, Validators.maxLength(20000)]],
      descriptionEn: ["", [Validators.required, Validators.maxLength(20000)]],
      coverImage: [
        "",
        [
          Validators.required,
          Validators.maxLength(2000),
          this.httpUrlValidator,
        ],
      ],
      video: ["", [Validators.maxLength(2000), this.optionalHttpUrlValidator]],
      tags: [""],
      tagsEn: [""],
      year: ["", [Validators.required, Validators.maxLength(20)]],
      projectType: [""],
      projectTypeEn: [""],
      button: this.fb.group(
        {
          label: ["", [Validators.maxLength(120)]],
          link: [
            "",
            [
              Validators.maxLength(2000),
              this.optionalHttpUrlValidator,
            ],
          ],
        },
        { validators: this.optionalButtonValidator },
      ),
      buttonEn: this.fb.group(
        {
          label: ["", [Validators.maxLength(120)]],
          link: [
            "",
            [
              Validators.maxLength(2000),
              this.optionalHttpUrlValidator,
            ],
          ],
        },
        { validators: this.optionalButtonValidator },
      ),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (!id) return;

    this.postId.set(id);
    this.loadingPost.set(true);

    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.form.patchValue({
          title: post.title,
          titleEn: post.titleEn || post.title,
          description: post.description || post.content || "",
          descriptionEn:
            post.descriptionEn || post.description || post.content || "",
          coverImage: post.coverImage || "",
          video: post.video || post.videos?.[0] || "",
          tags: (post.categories || post.tags || []).join(", "),
          tagsEn: (post.categoriesEn?.length
            ? post.categoriesEn
            : post.categories || post.tags || []
          ).join(", "),
          year: post.year || "",
          projectType: Array.isArray(post.projectType)
            ? post.projectType.join(", ")
            : post.projectType || "",
          projectTypeEn: this.getProjectTypeFallback(post.projectTypeEn, post.projectType),
          button: {
            label: post.button?.label || "",
            link: post.button?.link || "",
          },
          buttonEn: {
            label: post.buttonEn?.label || post.button?.label || "",
            link: post.buttonEn?.link || post.button?.link || "",
          },
        });
        this.selectedImageFiles.set(this.getPostImages(post.images));
        this.loadingPost.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erro ao carregar post");
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
      titleEn: formValue.titleEn,
      description: formValue.description,
      descriptionEn: formValue.descriptionEn,
      content: formValue.description,
      button: this.parseButton(formValue.button),
      buttonEn: this.parseButton(formValue.buttonEn),
      categories: this.parseList(formValue.tags),
      categoriesEn: this.parseList(formValue.tagsEn),
      year: this.parseOptionalText(formValue.year),
      projectType: this.parseList(formValue.projectType),
      projectTypeEn: this.parseList(formValue.projectTypeEn),
      images: this.selectedImageFiles(),
      video: this.parseOptionalText(formValue.video),
    };

    const request = this.postId()
      ? this.postService.updatePost(this.postId()!, postData)
      : this.postService.createPost(postData);

    request.subscribe({
      next: () => {
        this.success.set(
          this.postId()
            ? "Post atualizado com sucesso!"
            : "Post criado com sucesso!",
        );
        this.loading.set(false);
        setTimeout(() => this.router.navigate(["/admin"]), 900);
      },
      error: (err) => {
        const validationErrors = err.error?.errors;
        const details = Array.isArray(validationErrors)
          ? `: ${validationErrors.join("; ")}`
          : "";
        this.error.set(
          `${err.error?.message || "Erro ao salvar post"}${details}`,
        );
        this.loading.set(false);
      },
    });
  }

  onImageSelectionChange(images: ProjectPostImage[]): void {
    this.selectedImageFiles.set(images);
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

  private parseButton(
    value: { label?: string; link?: string } | null,
  ): CreatePostRequest["button"] {
    const label = value?.label?.trim();
    const link = value?.link?.trim();

    return {
      label: label || "",
      link: link || "",
    };
  }

  private parseOptionalText(value: string): string {
    const trimmedValue = value?.trim();
    return trimmedValue || "";
  }

  private httpUrlValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }

    return isHttpUrl(value) ? null : { url: true };
  }

  private optionalHttpUrlValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const value = control.value;

    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }

    return isHttpUrl(value) ? null : { url: true };
  }

  private optionalButtonValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const label = control.get("label")?.value?.trim();
    const link = control.get("link")?.value?.trim();

    if (!label && !link) return null;

    return label && link ? null : { buttonPair: true };
  }

  private getPostImages(images: unknown): ProjectPostImage[] {
    if (!Array.isArray(images)) return [];

    return images
      .map((image) => {
        if (typeof image === "string") {
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

  private getProjectTypeFallback(
    projectTypeEn: string | string[] | undefined,
    projectType: string | string[] | undefined,
  ): string {
    const value = Array.isArray(projectTypeEn)
      ? projectTypeEn
      : projectTypeEn
        ? [projectTypeEn]
        : [];

    if (value.length) return value.join(", ");

    return Array.isArray(projectType)
      ? projectType.join(", ")
      : projectType || "";
  }
}
