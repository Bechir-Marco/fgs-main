import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from 'app/auth/service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /**
   *
   * @param {Router} _router
   * @param {AuthenticationService} _authenticationService
   */
  constructor(private _router: Router, private _authenticationService: AuthenticationService) {}

  // canActivate
canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  const currentUser = this._authenticationService.currentUserValue;
  const storedUser = JSON.parse(localStorage.getItem('currentUser'));  // Parse JSON string
  const token = storedUser?.token;  // Safely access token
  console.log("AuthGuard - currentUser:", currentUser);
  console.log("AuthGuard - token:", token);
  console.log("AuthGuard - route:", state.url);
  if (currentUser && token) {
    console.log("User exists with token - proceeding");
    return true;
  }
  console.log("No user or token - redirecting to login");
  this._router.navigate(['/pages/authentication/login-v2'], { queryParams: { returnUrl: state.url } });
  return false;
}
}
