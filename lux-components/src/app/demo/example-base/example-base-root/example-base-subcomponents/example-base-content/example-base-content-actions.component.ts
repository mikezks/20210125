import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'example-base-content-actions',
  template: '<ng-content select="lux-button"></ng-content>'
})
export class ExampleBaseContentActionsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
