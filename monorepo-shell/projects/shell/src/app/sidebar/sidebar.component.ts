import { Component } from '@angular/core';
import { OutletStateService } from '../outlet-state.service';

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})
export class SidebarComponent {
  singleOutlet$ = this.outletState.singleOutlet$;
  naviation = [
    {
      label: 'Home',
      link: {
        single: '/home',
        multi: ['/', { outlets: { left: null, right: null }}]
      },
      icon: [ 'nc-icon', 'nc-bank' ]
    },
    {
      label: 'Flights',
      link: {
        single: '/flights',
        multi: ['/', { outlets: { left: ['flights'] }}]
      },
      icon: [ 'nc-icon', 'nc-send' ]
    },
    {
      label: 'Passengers',
      link: {
        single: '/passengers',
        multi: ['/', { outlets: { right: ['passengers'] }}]
      },
      icon: [ 'nc-icon', 'nc-single-02' ]
    },
    {
      label: 'LUX',
      link: {
        single: '/lux',
        multi: ['/', { outlets: { left: ['lux'] }}]
      },
      icon: [ 'nc-icon', 'nc-layout-11' ]
    },
  ];

  constructor(private outletState: OutletStateService) {}
}
