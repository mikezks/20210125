import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lux-label',
  template: '<span [id]="luxId"><ng-content></ng-content></span>'
})
export class LuxLabelComponent implements OnInit {
  @Input() luxId;

  constructor() {}

  ngOnInit() {
    if (!this.luxId) {
      console.error('lux-label -> Das Attribut "luxId" muss gesetzt werden.');
    }
  }
}
