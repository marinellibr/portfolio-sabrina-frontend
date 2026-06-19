import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { routes } from "./app.routes";
import { analyticsTimingInterceptor } from "./interceptors/analytics-timing.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([analyticsTimingInterceptor])),
    provideTranslateService({ lang: "pt", fallbackLang: "pt" }),
    provideTranslateHttpLoader({ prefix: "/i18n/", suffix: ".json" }),
  ],
};
