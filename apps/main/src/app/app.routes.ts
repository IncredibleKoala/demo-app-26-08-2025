import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/movies',
  },
  {
    path: 'movies',
    loadComponent: () => import('@demo-app/movies-feature-main').then((m) => m.MoviesFeatureMainComponent),
  },
];
