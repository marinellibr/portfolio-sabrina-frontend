import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trackSession, trackPageLoad, trackClick } from 'data-analytics-lib';
import { PostService } from './services/post.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  private readonly appID = 'portfolio-sabrina';
  private readonly sessionID = 'sess-' + Math.random().toString(36).substring(2, 11);

  private readonly postService = inject(PostService);

  async ngOnInit() {
    const startTime = Date.now();

    await trackSession({
      sessionID: this.sessionID,
      appID: this.appID,
      context: {
        device: 'desktop',
        browser: navigator.userAgent,
        referrer: document.referrer || 'direct'
      }
    });

    this.postService.getPosts().subscribe({
      next: (posts) => console.log('Posts:', posts),
      error: (err) => console.error('Erro ao buscar posts:', err)
    });

    const response = await trackPageLoad({
      sessionID: this.sessionID,
      appID: this.appID,
      location: window.location.pathname,
      timeOnPage: Date.now() - startTime
    });

    if (response.success) {
      console.log('✓ Screen view rastreada');
    } else {
      console.error('✗ Erro ao rastrear screen view:', response.error);
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.trackButtonClick('theme-toggle');
  }

  trackButtonClick(element: string) {
    trackClick({
      sessionID: this.sessionID,
      appID: this.appID,
      location: window.location.pathname,
      element
    });
  }
}
