import { Component, inject, OnInit } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { PostService } from "../../services/post.service";

@Component({
  selector: "app-projects",
  imports: [TranslatePipe],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent implements OnInit {
  private readonly postService = inject(PostService);

  ngOnInit() {
    this.postService.getPostsSummary().subscribe({
      next: (summary) => console.log("Posts summary:", summary),
      error: (err) => console.error("Erro ao buscar posts summary:", err),
    });
  }
}
