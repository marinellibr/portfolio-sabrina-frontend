import { Component } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-about",
  imports: [TranslatePipe],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
})
export class AboutComponent {
  openCurriculum() {
    console.log("Curriculum button clicked");
  }
}
