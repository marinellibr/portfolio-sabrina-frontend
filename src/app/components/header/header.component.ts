import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive } from "@angular/router";
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
  constructor(private languageService: LanguageService) {}

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
