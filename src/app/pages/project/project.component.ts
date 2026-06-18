import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { PostSummary } from '../../models/post.model';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  private readonly postService = inject(PostService);

  posts: PostSummary[] = [];

  ngOnInit() {
    this.postService.getPostsSummary().subscribe({
      next: (summary) => console.log('Posts summary:', summary),
      error: (err) => console.error('Erro ao buscar posts summary:', err)
    });
  }
}
