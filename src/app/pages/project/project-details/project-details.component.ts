import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PostService } from "../../../services/post.service";

@Component({
  selector: "app-project-details",
  standalone: true,
  imports: [],
  templateUrl: "./project-details.component.html",
  styleUrl: "./project-details.component.scss",
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly postService = inject(PostService);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      console.error("Project id não encontrado na rota");
      return;
    }

    this.postService.getPostById(id).subscribe({
      next: (post) => console.log("Post by id:", post),
      error: (err) => console.error("Erro ao buscar post por id:", err),
    });
  }
}
