import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mf-flight',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private router: Router) {
    router.initialNavigation();
    router.navigateByUrl('');
  }
}
