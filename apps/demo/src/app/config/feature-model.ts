import { Route } from '@angular/router';

export interface Feature extends Route {
  name: string;
  description: string;
  iconUrl: string;
}
