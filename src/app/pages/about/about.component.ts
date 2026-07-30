import { Component } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { CurriculumService } from "../../services/curriculum.service";

@Component({
  selector: "app-about",
  imports: [TranslatePipe],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
})
export class AboutComponent {
  constructor(private curriculumService: CurriculumService) {}

  openCurriculum() {
    this.curriculumService.open();
  }
}
