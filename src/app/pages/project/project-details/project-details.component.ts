import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { Post, ProjectPostButton } from "../../../models/post.model";
import { PostService } from "../../../services/post.service";

@Component({
  selector: "app-project-details",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./project-details.component.html",
  styleUrl: "./project-details.component.scss",
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly postService = inject(PostService);
  private readonly translate = inject(TranslateService);
  post: Post | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      console.error("Project id não encontrado na rota");
      return;
    }

    this.postService.getPostById(id).subscribe({
      next: (post) => {
        console.log("Post by id:", post);
        this.post = post;
      },
      error: (err) => console.error("Erro ao buscar post por id:", err),
    });
  }

  getProjectTypes(project: Post): string[] {
    const projectType =
      this.isEnglish() && this.hasListValue(project.projectTypeEn)
        ? project.projectTypeEn
        : project.projectType;

    if (!projectType) return [];
    return Array.isArray(projectType) ? projectType : [projectType];
  }

  getProjectCategories(project: Post): string[] {
    if (this.isEnglish() && project.categoriesEn?.length) {
      return project.categoriesEn;
    }

    return project.categories || [];
  }

  getProjectImages(project: Post): string[] {
    if (!Array.isArray(project.images)) return [];

    return project.images
      .map((image) => (typeof image === "string" ? image : image.url))
      .filter((url): url is string => Boolean(url));
  }

  getVideoUrl(project: Post): SafeResourceUrl | null {
    if (!project.video) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(project.video);
  }

  getProjectTitle(project: Post): string {
    return this.isEnglish() && project.titleEn ? project.titleEn : project.title;
  }

  getProjectDescription(project: Post): string {
    if (this.isEnglish() && project.descriptionEn) return project.descriptionEn;
    return project.description || project.content || "";
  }

  getProjectButton(project: Post): Partial<ProjectPostButton> | null {
    const button = this.isEnglish()
      ? {
          label: project.buttonEn?.label || project.button?.label,
          link: project.buttonEn?.link || project.button?.link,
        }
      : project.button;

    return button?.label && button?.link ? button : null;
  }

  private isEnglish(): boolean {
    return this.translate.currentLang() === "en";
  }

  private hasListValue(value: string | string[] | undefined): boolean {
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }
}
