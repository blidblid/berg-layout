import {
  AngularCodePrinter,
  CodePrinter,
  ReactCodePrinter,
  WebComponentCodePrinter,
} from '../code';
import { DemoComponent } from '../demo';
import { Feature } from './feature-model';

export const FEATURES: Feature[] = [
  {
    name: 'React',
    path: 'react',
    iconUrl: 'assets/react.png',
    component: DemoComponent,
    providers: [
      {
        provide: CodePrinter,
        useClass: ReactCodePrinter,
      },
    ],
  },
  {
    name: 'Angular',
    path: 'angular',
    iconUrl: 'assets/angular.png',
    component: DemoComponent,
    providers: [
      {
        provide: CodePrinter,
        useClass: AngularCodePrinter,
      },
    ],
  },
  {
    name: 'Web component',
    path: 'core',
    iconUrl: 'assets/web-component.png',
    component: DemoComponent,
    providers: [
      {
        provide: CodePrinter,
        useClass: WebComponentCodePrinter,
      },
    ],
  },
];
