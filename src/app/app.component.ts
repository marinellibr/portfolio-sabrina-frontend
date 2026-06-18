import { Component, inject, OnInit } from '@angular/core';
import { PostService } from './services/post.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  private readonly postService = inject(PostService);

  ngOnInit() {
    this.postService.getPosts().subscribe({
      next: (posts) => console.log('Posts:', posts),
      error: (err) => console.error('Erro ao buscar posts:', err)
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }
}
