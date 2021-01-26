import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Passenger} from '../entities/passenger';

@Injectable({ providedIn: 'root' })
export class PassengerDataService {
  private passengerListSubject = new BehaviorSubject<Passenger[]>([]);
  passengerList$ = this.passengerListSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(from: string, to: string): void {
    this.find(from, to).subscribe(
      passengerList => {
          this.passengerListSubject.next(passengerList)
      },
      err => {
          console.error('err', err);
      }
    );
  }

  find(name: string, firstName: string): Observable<Passenger[]> {
    const url = 'http://demo.angulararchitects.io/api/passenger';

    const params = new HttpParams()
      .set('name', name)
      .set('firstName', firstName);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Passenger[]>(url, {params, headers});
  }
}
