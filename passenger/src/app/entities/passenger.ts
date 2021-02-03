export interface Passenger {
  id: number;
  name: string;
  firstName: string;
  bonusMiles: number;
  passengerStatus: string;
}

export const initialFlight: Passenger = {
  id: 0,
  name: '',
  firstName: '',
  bonusMiles: 0,
  passengerStatus: ''
};
