import { NgModule } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { filter, map } from 'rxjs';
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
export class AppRoutingModule {
  private feature$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this.router.url),
    map((url) => {
      return FEATURES.find(
        (feature) => feature.path && url.includes(feature.path)
      );
    })
  );

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {
    this.feature$.subscribe((feature) => {
      if (feature) {
        const title = `Berg Layout - ${feature.name}`;
        const description = feature.description;
        this.updateMetaTags(title, description);
      } else {
        this.updateMetaTags(
          'Berg Layout',
          'A resizable, collapsible, accessible and open-source layout component.'
        );
      }
    });
  }

  private updateMetaTags(title: string, description: string) {
    this.title.setTitle(title);

    const metaDefinition: MetaDefinition[] = [
      { name: 'title', content: title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
    ];

    for (const meta of metaDefinition) {
      this.meta.updateTag(meta);
    }
  }
}
