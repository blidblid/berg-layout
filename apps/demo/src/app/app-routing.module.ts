import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularDemoComponent } from './angular-demo/angular-demo.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'angular',
        component: AngularDemoComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
