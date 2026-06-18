import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'lang';

  constructor(private translate: TranslateService) {}

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Lang | null;
    this.translate.use(saved ?? 'pt');
  }

  get current(): Lang {
    return (this.translate.currentLang() ?? 'pt') as Lang;
  }

  toggle() {
    const next: Lang = this.current === 'pt' ? 'en' : 'pt';
    this.translate.use(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }
}
