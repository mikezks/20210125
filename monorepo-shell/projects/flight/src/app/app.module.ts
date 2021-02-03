import { LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApplicationRef, APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CustomPathLocationStrategy, MicroAppPlatform, MicroAppType } from '@intauria/micro-app-platform';
import { ReactiveComponentModule } from '@ngrx/component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './feature-home/home.component';
import { SearchComponent } from './feature-search/search.component';
import { UiCardComponent } from './ui-card/flight-ui-card.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    UiCardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveComponentModule,
    AppRoutingModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: CustomPathLocationStrategy }
  ]
})
export class AppModule {
  constructor(private microAppPlatform: MicroAppPlatform) {}

  ngDoBootstrap(app: ApplicationRef): void {
    this.microAppPlatform.setMicroApp({
      id: 'mf-flight',
      tagname: 'mf-flight',
      bootstrapFn: () => app.bootstrap(AppComponent),
      type: MicroAppType.ngRootComponentLegacy
    });
  }
}
