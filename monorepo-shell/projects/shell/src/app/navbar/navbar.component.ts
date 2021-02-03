import { Component } from '@angular/core';
import { OutletStateService } from '../outlet-state.service';

@Component({
    selector: 'app-navbar-cmp',
    templateUrl: 'navbar.component.html'
})
export class NavbarComponent {
  singleOutlet$ = this.outletState.singleOutlet$;
  sidebarVisible: boolean = false;

  constructor(private outletState: OutletStateService) {}

  toogleSingleOutlet(): void {
    this.outletState.singleOutlet$.next(!this.singleOutlet$.value);
  }

  sidebarToggle(){
    var body = document.getElementsByTagName('body')[0];

    if(this.sidebarVisible == false){
      body.classList.add('nav-open');
      this.sidebarVisible = true;
    } else {
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }
}
