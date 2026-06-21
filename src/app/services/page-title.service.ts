import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class PageTitleService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);

  private readonly prefix = "sabrinacardoso/";
  private currentKey: string | null = null;

  // Atualiza o título "sabrinacardoso/<página>" a cada navegação e
  // reaplica quando o idioma muda.
  init() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.currentKey = this.resolveTitleKey();
        this.apply();
      });

    this.translate.onLangChange.subscribe(() => this.apply());
  }

  // Percorre até a rota mais profunda e lê a chave de tradução do título
  private resolveTitleKey(): string | null {
    let route = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data["titleKey"] ?? null;
  }

  private apply() {
    if (!this.currentKey) {
      this.title.setTitle("sabrinacardoso");
      return;
    }
    this.translate
      .get(this.currentKey)
      .subscribe((translated) => this.title.setTitle(this.prefix + translated));
  }
}
