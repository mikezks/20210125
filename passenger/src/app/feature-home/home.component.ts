import { Component, VERSION} from '@angular/core';

@Component({
  selector: 'passenger-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  version = VERSION;
  publicPath = __webpack_public_path__;
}
