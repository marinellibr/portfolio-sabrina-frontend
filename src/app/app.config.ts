import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideServiceWorker } from "@angular/service-worker";
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { routes } from "./app.routes";
import { analyticsTimingInterceptor } from "./interceptors/analytics-timing.interceptor";
import { jwtInterceptor } from "./interceptors/jwt.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, analyticsTimingInterceptor])),
    provideTranslateService({ lang: "pt", fallbackLang: "pt" }),
    provideTranslateHttpLoader({ prefix: "/i18n/", suffix: ".json" }),
    // Service worker: habilitado apenas em produção, registrado após a app
    // estabilizar para não competir com o carregamento inicial.
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
};
