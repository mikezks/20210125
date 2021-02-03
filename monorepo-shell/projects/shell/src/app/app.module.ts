import { HttpClientModule } from '@angular/common/http';
import { NgModule, NgZone } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { MicroAppPlatform } from '@intauria/micro-app-platform';


@NgModule({
   imports: [
      BrowserModule,
      HttpClientModule,
      AppRoutingModule
   ],
   declarations: [
      AppComponent,
      SidebarComponent,
      NavbarComponent,
      HomeComponent
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule {
  constructor(
    private ngZone: NgZone,
    private microAppPlatform: MicroAppPlatform) {

    this.microAppPlatform.setNgZone(ngZone);
  }
}
