import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OutletStateService {
  singleOutlet$ = new BehaviorSubject<boolean>(true);
}
