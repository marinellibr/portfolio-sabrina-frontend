import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";
import { AnalyticsService } from "../../services/analytics.service";

@Component({
  selector: "app-building",
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: "./building.component.html",
  styleUrl: "./building.component.scss",
})
export class BuildingComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);

  ngOnInit() {
    this.analytics.trackRoute("/building");
  }

  onBehanceClick() {
    this.analytics.trackClick("behance");
    window.open("https://www.behance.net/sabrinacardoso7", "_blank");
  }

  onLinkedInClick() {
    this.analytics.trackClick("linkedin");
    window.open("https://www.linkedin.com/in/sabrinascardoso/", "_blank");
  }
}
