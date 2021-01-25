import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [
    `
    .app-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      grid-gap: 20px;
    }
    `
  ]
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Hello World!';
}
