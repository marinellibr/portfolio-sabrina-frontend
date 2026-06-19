import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-building",
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: "./building.component.html",
  styleUrl: "./building.component.scss",
})
export class BuildingComponent {
  newTab(url: string) {
    window.open(url, "_blank");
  }
}
