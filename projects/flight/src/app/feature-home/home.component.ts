import { Component, VERSION} from '@angular/core';

@Component({
  selector: 'flight-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  version = VERSION;
}
