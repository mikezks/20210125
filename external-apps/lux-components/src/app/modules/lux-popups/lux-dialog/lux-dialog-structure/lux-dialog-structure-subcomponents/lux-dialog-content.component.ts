import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lux-dialog-content',
  template: '<ng-content></ng-content>'
})
export class LuxDialogContentComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
