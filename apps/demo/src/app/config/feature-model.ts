import { Route } from '@angular/router';

export interface Feature extends Route {
  name: string;
  iconUrl: string;
}
