import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

const API_BASE_URL = 'https://portfolio-sabrina-backend.vercel.app';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isApiRequest = req.url.startsWith(API_BASE_URL);

  if (token && isApiRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApiRequest && error.status === 401) {
        authService.handleUnauthorized();
      }

      if (error.status === 429) {
        console.error('Rate limit atingido. Tente novamente em alguns minutos.');
      }

      return throwError(() => error);
    })
  );
};
