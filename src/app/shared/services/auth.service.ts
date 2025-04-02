import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from '../../auth.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oauthService: OAuthService) {
    oauthService.configure(authCodeFlowConfig)
    oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (!oauthService.hasValidAccessToken()) {
        oauthService.initCodeFlow()
      }
    })
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken()
  }
}
