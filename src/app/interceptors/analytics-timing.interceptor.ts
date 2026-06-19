import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { tap } from "rxjs/operators";
import { AnalyticsService } from "../services/analytics.service";

/**
 * Mede o tempo de resposta (duração) de cada chamada HTTP a APIs externas
 * e o envia para a analytics via trackHttpCall. Requisições a assets locais
 * (ex.: arquivos de i18n com URL relativa) são ignoradas.
 */
export const analyticsTimingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!/^https?:\/\//.test(req.url)) {
    return next(req);
  }

  const analytics = inject(AnalyticsService);
  const startTime = Date.now();

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          analytics.trackHttpCall(
            req.url,
            req.method,
            event.status,
            Date.now() - startTime,
          );
        }
      },
      error: (error) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        analytics.trackHttpCall(
          req.url,
          req.method,
          status,
          Date.now() - startTime,
        );
      },
    }),
  );
};
