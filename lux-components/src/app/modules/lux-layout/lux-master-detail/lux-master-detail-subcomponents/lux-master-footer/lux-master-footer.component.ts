import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lux-master-footer',
  template: '<ng-content></ng-content>',
  styleUrls: ['./lux-master-footer.component.scss']
})
export class LuxMasterFooterComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
