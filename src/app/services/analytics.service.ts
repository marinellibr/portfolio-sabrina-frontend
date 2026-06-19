import { Injectable } from "@angular/core";
import { trackSession, trackPageLoad, trackClick } from "data-analytics-lib";

@Injectable({ providedIn: "root" })
export class AnalyticsService {
  private readonly appID = "portfolio-sabrina";
  private readonly sessionID =
    "sess-" + Math.random().toString(36).substring(2, 11);

  private pageEnterTime = Date.now();
  private lastLocation: string | null = null;

  async initSession() {
    await trackSession({
      sessionID: this.sessionID,
      appID: this.appID,
      context: {
        device: "desktop",
        browser: navigator.userAgent,
        referrer: document.referrer || "direct",
      },
    });
  }

  async trackScreenView(location: string) {
    // Evita disparo duplicado para a mesma página (ex.: load inicial)
    if (location === this.lastLocation) {
      return;
    }
    this.lastLocation = location;

    const timeOnPage = Date.now() - this.pageEnterTime;
    this.pageEnterTime = Date.now();

    const response = await trackPageLoad({
      sessionID: this.sessionID,
      appID: this.appID,
      location,
      timeOnPage,
    });

    if (response.success) {
      console.log("✓ Screen view rastreada:", location);
    } else {
      console.error("✗ Erro ao rastrear screen view:", response.error);
    }
  }

  trackClick(element: string) {
    trackClick({
      sessionID: this.sessionID,
      appID: this.appID,
      location: window.location.pathname,
      element,
    });
  }
}
