import { Component } from '@angular/core';
import { FlightDataService } from '../data-access/flight.data.service';

@Component({
  selector: 'flight-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  from = 'Hamburg';
  to = '';
  urgent = false;
  flightList$ = this.dataService.flightList$;
  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  constructor(private dataService: FlightDataService) {
  }

  load(): void {
      this.dataService.load(this.from, this.to);
  };
}
