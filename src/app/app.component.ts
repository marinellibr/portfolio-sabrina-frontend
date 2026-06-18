import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { trackSession, trackPageLoad, trackClick } from 'data-analytics-lib';
import { PostService } from './services/post.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  private readonly appID = 'portfolio-sabrina';
  private readonly sessionID = 'sess-' + Math.random().toString(36).substring(2, 11);

  private readonly postService = inject(PostService);
  readonly lang = inject(LanguageService);

  async ngOnInit() {
    this.lang.init();

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

    this.postService.getPostsSummary().subscribe({
      next: (summary) => console.log('Posts summary:', summary),
      error: (err) => console.error('Erro ao buscar posts summary:', err)
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
