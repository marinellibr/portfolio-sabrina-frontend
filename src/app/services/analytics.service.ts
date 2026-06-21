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

  // Tela atual e momento em que o usuário entrou nela
  private routeLocation: string | null = null;
  private routeEnterTime = Date.now();

  async initSession() {
    // Registra o tempo da tela atual quando a aba é fechada/recarregada
    // sem troca de rota (pagehide não dispara em troca de aba)
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", () => this.flushScreenTime());
    }

    const source = this.resolveSource();

    await this.log(
      "session",
      `${this.sessionID} | source: ${source.utm ?? "none"} | referrer: ${source.referrer}`,
      trackSession({
        sessionID: this.sessionID,
        appID: this.appID,
        context: {
          device: "desktop",
          browser: navigator.userAgent,
          referrer: source.referrer,
          utmSource: source.utm ?? undefined,
        },
      }),
    );
  }

  // Determina a origem da visita: prioriza UTM (link rastreado intencionalmente)
  // e cai para document.referrer (clique orgânico) ou "direct".
  private resolveSource(): { utm: string | null; referrer: string } {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    let utm: string | null = null;
    if (utmSource) {
      utm = utmSource;
      if (utmMedium) utm += `/${utmMedium}`;
      if (utmCampaign) utm += `/${utmCampaign}`;
    }

    const referrer = document.referrer
      ? this.parseReferrer(document.referrer)
      : "direct";

    return { utm, referrer };
  }

  // Extrai o domínio limpo do referrer (ex.: "linkedin.com")
  private parseReferrer(raw: string): string {
    try {
      return new URL(raw).hostname.replace(/^www\./, "");
    } catch {
      return raw;
    }
  }

  // Marca a entrada numa tela: fecha o tempo da tela anterior e reinicia
  // a contagem. Não envia evento na entrada — só ao sair (troca de rota).
  trackRoute(location: string) {
    // Evita disparo duplicado para a mesma página (ex.: load inicial)
    if (location === this.lastLocation) {
      return;
    }
    this.lastLocation = location;

    this.flushScreenTime();
    this.routeLocation = location;
    this.routeEnterTime = Date.now();
  }

  // Guarda o tempo que o usuário passou na tela atual (timeOnPage) até a
  // ação que muda a rota — ou até a aba ser fechada/recarregada.
  flushScreenTime() {
    if (this.routeLocation === null) {
      return;
    }
    const location = this.routeLocation;
    const timeOnPage = Date.now() - this.routeEnterTime;
    this.routeLocation = null;

    this.log(
      "screen-time",
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
