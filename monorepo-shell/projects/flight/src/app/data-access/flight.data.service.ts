import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Flight} from '../entities/flight';

@Injectable({ providedIn: 'root' })
export class FlightDataService {
  private flightListSubject = new BehaviorSubject<Flight[]>([]);
  flightList$ = this.flightListSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(from: string, to: string): void {
    this.find(from, to).subscribe(
      flightList => {
          this.flightListSubject.next(flightList)
      },
      err => {
          console.error('err', err);
      }
    );
  }

  find(from: string, to: string): Observable<Flight[]> {
    const url = 'http://demo.angulararchitects.io/api/flight';

    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, {params, headers});
  }
}
