import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive, Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { SwitchComponent } from "../switch/switch.component";
import { CommonModule } from "@angular/common";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, TranslatePipe, SwitchComponent],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  get isHome(): boolean {
    return this.router.url === "/" || this.router.url === "";
  }

  get lang(): boolean {
    return this.languageService.current === "en";
  }

  set lang(value: boolean) {
    const target = value ? "en" : "pt";
    if (this.languageService.current !== target) {
      this.languageService.toggle();
    }
  }
}
