import {
  AngularCodePrinter,
  CodePrinter,
  ReactCodePrinter,
  WebComponentCodePrinter,
} from '../code';
import { DemoComponent } from '../demo';
import { Feature } from './feature-model';

export const REACT_FEATURE = {
  name: 'React',
  path: 'react',
  iconUrl: 'assets/react.png',
  description: 'React components for Berg Layout.',
  component: DemoComponent,
  providers: [
    {
      provide: CodePrinter,
      useClass: ReactCodePrinter,
    },
  ],
};

export const ANGULAR_FEATURE = {
  name: 'Angular',
  path: 'angular',
  iconUrl: 'assets/angular.png',
  description: 'Angular components for Berg Layout.',
  component: DemoComponent,
  providers: [
    {
      provide: CodePrinter,
      useClass: AngularCodePrinter,
    },
  ],
};

export const WEB_COMPONENT_FEATURE = {
  name: 'Web Component',
  path: 'core',
  iconUrl: 'assets/web-component.png',
  description: 'Web components for Berg Layout.',
  component: DemoComponent,
  providers: [
    {
      provide: CodePrinter,
      useClass: WebComponentCodePrinter,
    },
  ],
};

export const FEATURES: Feature[] = [
  REACT_FEATURE,
  ANGULAR_FEATURE,
  WEB_COMPONENT_FEATURE,
];
