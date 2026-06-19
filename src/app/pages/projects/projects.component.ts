import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { PostService } from "../../services/post.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-projects",
  imports: [TranslatePipe, CommonModule],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private readonly postService = inject(PostService);
  projects: any[] = [];
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
        if (project && project.images && project.images.length > 1) {
          const nextIndex = (currentIndex + 1) % project.images.length;
          this.imageIndices.set(projectIndex, nextIndex);
        }
      });
    }, 2000);
  }

  getCurrentImage(project: any, projectIndex: number): string {
    const imageIndex = this.imageIndices.get(projectIndex) || 0;
    return project.images[imageIndex] || project.images[0];
  }
}
