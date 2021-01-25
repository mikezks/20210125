import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Flight, initialFlight } from '../entities/flight';

@Component({
  selector: 'flight-ui-card',
  templateUrl: './flight-ui-card.component.html',
  styleUrls: ['./flight-ui-card.component.scss']
})
export class UiCardComponent {

  @Input() item = initialFlight;
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<boolean>();

  constructor() {}

  toggleSelection() {
    this.selected = !this.selected;
    this.selectedChange.next(this.selected);
  }
}
