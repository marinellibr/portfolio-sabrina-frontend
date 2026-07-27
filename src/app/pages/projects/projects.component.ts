import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { PostSummary, ProjectPostImage } from "../../models/post.model";
import { PostService } from "../../services/post.service";
import { AnalyticsService } from "../../services/analytics.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-projects",
  imports: [TranslatePipe, CommonModule, RouterLink],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private readonly postService = inject(PostService);
  private readonly analytics = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);
  readonly itemsPerPage = 6;
  projects: PostSummary[] = [];
  currentPage = 1;
  private imageIndices: Map<number, number> = new Map();
  private intervalId: any;

  ngOnInit() {
    this.postService.getPostsSummary().subscribe({
      next: (summary) => {
        console.log("Posts summary:", summary);
        this.projects = summary;
        // Inicializar índices para cada projeto
        this.projects.forEach((_, index) => {
          this.imageIndices.set(index, 0);
        });
        // Iniciar rotação de imagens
        this.startImageRotation();
      },
      error: (err) => console.error("Erro ao buscar posts summary:", err),
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startImageRotation() {
    this.intervalId = setInterval(() => {
      this.imageIndices.forEach((currentIndex, projectIndex) => {
        const project = this.projects[projectIndex];
        const images = this.getProjectImageUrls(project);

        if (images.length > 1) {
          const nextIndex = (currentIndex + 1) % images.length;
          this.imageIndices.set(projectIndex, nextIndex);
        }
      });
    }, 2000);
  }

  get paginatedProjects(): PostSummary[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.projects.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.projects.length / this.itemsPerPage);
  }

  getProjectIndex(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index;
  }

  getCurrentImage(project: PostSummary, projectIndex: number): string {
    const imageIndex = this.imageIndices.get(projectIndex) || 0;
    const images = this.getProjectImageUrls(project);

    return images[imageIndex] || images[0] || "";
  }

  onProjectClick(project: PostSummary) {
    this.analytics.trackClick(`gallery-item-${project._id}`);
  }

  getProjectTitle(project: PostSummary): string {
    return this.translate.currentLang() === "en" && project.titleEn
      ? project.titleEn
      : project.title;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  private getProjectImageUrls(project: PostSummary): string[] {
    const coverImages = Array.isArray(project.images)
      ? project.images
          .filter(
            (image): image is ProjectPostImage =>
              typeof image !== "string" && Boolean(image.cover && image.url),
          )
          .map((image) => image.url)
      : [];

    return this.uniqueImageUrls([
      ...(project.coverImage ? [project.coverImage] : []),
      ...coverImages,
    ]);
  }

  private uniqueImageUrls(urls: string[]): string[] {
    return [...new Set(urls.filter(Boolean))];
  }
}
