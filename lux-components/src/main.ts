import './public-path';
import { enableProdMode, VERSION } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { getMicroAppPlatform } from '@intauria/micro-app-platform';
import { AppModule } from './app/app.module';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

getMicroAppPlatform().ngBootstrap(platformBrowserDynamic, AppModule, VERSION)
  .catch(err => console.log(err));
