import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FEATURES } from './config';
import { HomeComponent } from './home';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      ...FEATURES,
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
