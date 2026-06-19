import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { LanguageService } from "./services/language.service";
import { AnalyticsService } from "./services/analytics.service";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  readonly lang = inject(LanguageService);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);

  async ngOnInit() {
    this.lang.init();

    await this.analytics.initSession();

    // Screen view inicial + a cada navegação (cobre todas as páginas)
    this.analytics.trackScreenView(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.analytics.trackScreenView(e.urlAfterRedirects));
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.analytics.trackClick("theme-toggle");
  }
}
