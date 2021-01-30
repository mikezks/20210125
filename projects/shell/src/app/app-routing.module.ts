import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { importCustomElement } from '@intauria/micro-app-platform';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'flights',
    loadChildren: () => importCustomElement({
      tagname: 'mf-flight',
      scriptUrl: 'http://localhost:5100/main.js'
    }),
    outlet: 'left'
  },
  {
    path: 'passengers',
    loadChildren: () => importCustomElement(
      'mf-passenger',
      'http://localhost:5200/main.js'
    ),
    outlet: 'right'
  },
  {
    path: 'lux',
    loadChildren: () => importCustomElement(
      'lux-components-demo',
      'http://localhost:5300/main.js',
      'http://localhost:5300/styles.css'
    ),
    outlet: 'right'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
