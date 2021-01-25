import { Injectable, Optional, Inject } from '@angular/core';
import { PlatformLocation, APP_BASE_HREF, PathLocationStrategy } from '@angular/common';

@Injectable()
export class CustomPathLocationStrategy extends PathLocationStrategy {

  constructor(
    platformLocation: PlatformLocation,
    @Optional() @Inject(APP_BASE_HREF) href?: string) {
      super(platformLocation, href);
  }

  pushState(state: any, title: string, url: string, queryParams: string): void {}

  replaceState(state: any, title: string, url: string, queryParams: string): void {}
}
