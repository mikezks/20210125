import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { importCustomElement } from '@intauria/micro-app-platform';
import { HomeComponent } from './home/home.component';
import { OutletStateService } from './outlet-state.service';
import { distinctUntilChanged } from 'rxjs/operators';

const routes = (singleOutlet: boolean) => [
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
    outlet: singleOutlet ? 'primary' : 'left'
  },
  {
    path: 'passengers',
    loadChildren: () => importCustomElement(
      'mf-passenger',
      'http://localhost:5200/main.js'
    ),
    outlet: singleOutlet ? 'primary' : 'right'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes(true))],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(
    private router: Router,
    private outletState: OutletStateService) {

    this.outletState.singleOutlet$.pipe(
      distinctUntilChanged()
    ).subscribe(state => {
      this.router.resetConfig(routes(state));
      this.router.navigateByUrl('/');
    });
  }
}
