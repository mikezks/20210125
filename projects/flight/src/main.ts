import './public-path';
import { enableProdMode, VERSION } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { getMicroAppPlatform } from '@intauria/micro-app-platform';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

getMicroAppPlatform().ngBootstrap(platformBrowser, AppModule, VERSION)
  .catch(err => console.error(err));
