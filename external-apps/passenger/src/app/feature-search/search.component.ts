import { Component } from '@angular/core';
import { PassengerDataService } from '../data-access/passenger.data.service';
import { Passenger } from '../entities/passenger';

@Component({
  selector: 'passenger-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  firstname = '';
  name = 'S';
  passengerList$ = this.dataService.passengerList$;
  selectedPassenger: Passenger;

  constructor(private dataService: PassengerDataService) {
  }

  load(): void {
      this.dataService.load(this.name, this.firstname);
  };

  toggleSelection(p: Passenger) {
    this.selectedPassenger =
      this.selectedPassenger === p ?
      null :
      p;
  }
}

