import { Injectable } from "@angular/core";
import {
  trackSession,
  trackPageLoad,
  trackClick,
  trackHttpCall,
  HttpMethod,
  AnalyticsResponse,
} from "data-analytics-lib";

@Injectable({ providedIn: "root" })
export class AnalyticsService {
  private readonly appID = "portfolio-sabrina";
  private readonly sessionID =
    "sess-" + Math.random().toString(36).substring(2, 11);

  private lastLocation: string | null = null;

  // Rota atual e momento em que o usuário entrou nela
  private routeLocation: string | null = null;
  private routeEnterTime = Date.now();

  async initSession() {
    // Garante o registro do tempo da última rota ao fechar/ocultar a aba
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", () => this.flushRouteTime());
    }

    await this.log(
      "session",
      this.sessionID,
      trackSession({
        sessionID: this.sessionID,
        appID: this.appID,
        context: {
          device: "desktop",
          browser: navigator.userAgent,
          referrer: document.referrer || "direct",
        },
      }),
    );
  }

  async trackScreenView(location: string) {
    // Evita disparo duplicado para a mesma página (ex.: load inicial)
    if (location === this.lastLocation) {
      return;
    }
    this.lastLocation = location;

    // Fecha o tempo da rota anterior antes de iniciar a nova
    this.flushRouteTime();
    this.routeLocation = location;
    this.routeEnterTime = Date.now();

    await this.log(
      "screen-view",
      location,
      trackPageLoad({
        sessionID: this.sessionID,
        appID: this.appID,
        location,
        timeOnPage: 0, // entrada na rota; o tempo gasto vai no evento route-time
      }),
    );
  }

  // Guarda o tempo que o usuário passou na rota atual até a ação que a mudou
  // (ou até a aba ser fechada). Emitido como pageview com timeOnPage real.
  flushRouteTime() {
    if (this.routeLocation === null) {
      return;
    }
    const location = this.routeLocation;
    const timeOnPage = Date.now() - this.routeEnterTime;
    this.routeLocation = null;

    this.log(
      "route-time",
      `${location} (${timeOnPage}ms)`,
      trackPageLoad({
        sessionID: this.sessionID,
        appID: this.appID,
        location,
        timeOnPage,
      }),
    );
  }

  trackClick(element: string) {
    this.log(
      "click",
      element,
      trackClick({
        sessionID: this.sessionID,
        appID: this.appID,
        location: window.location.pathname,
        element,
      }),
    );
  }

  // Rastreia o tempo de resposta (duração) de uma chamada HTTP
  trackHttpCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
  ) {
    this.log(
      "http-call",
      `${method.toUpperCase()} ${endpoint} (${status}, ${duration}ms)`,
      trackHttpCall({
        sessionID: this.sessionID,
        appID: this.appID,
        endpoint,
        method: method.toUpperCase() as HttpMethod,
        status,
        duration,
      }),
    );
  }

  // Loga cada evento de analytics no formato [AÇÃO]: valores
  private async log(
    action: string,
    value: string,
    request: Promise<AnalyticsResponse>,
  ): Promise<void> {
    const tag = `[${action.toUpperCase()}]`;
    console.log(`${tag}: ${value}`);
    try {
      const response = await request;
      if (!response.success) {
        console.error(`${tag} erro: ${response.error?.message ?? "falhou"}`);
      }
    } catch (err) {
      console.error(`${tag} erro: ${err instanceof Error ? err.message : err}`);
    }
  }
}
