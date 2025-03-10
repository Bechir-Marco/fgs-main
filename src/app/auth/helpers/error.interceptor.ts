import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from 'app/auth/service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  /**
   * @param {Router} _router
   * @param {AuthenticationService} _authenticationService
   */
  constructor(private _router: Router, private _authenticationService: AuthenticationService) {}

intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return next.handle(request).pipe(
    catchError(err => {
      if ([401, 403].indexOf(err.status) !== -1) {
        if (!this._authenticationService.currentUserValue && 
            !this._router.url.includes('/pages/authentication/')) {
          console.log("No user, not on auth page - to /not-authorized");
          this._router.navigate(['/pages/miscellaneous/not-authorized']);
        } else {
          console.log("Skipping redirect - user:", this._authenticationService.currentUserValue);
        }
      }
      const error = err.error?.message || err.statusText;
      return throwError(() => new Error(error));
    })
  );
}
}
