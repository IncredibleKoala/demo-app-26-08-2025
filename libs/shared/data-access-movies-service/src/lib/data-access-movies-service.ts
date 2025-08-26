import { Injectable } from '@angular/core';
import { combineLatest, defer, delay, map, Observable, of, switchMap } from 'rxjs';
import { v4 } from 'uuid';
import { InMemoryStorage } from '@demo-app/shared/util-storage';
import { MovieDto } from '@demo-app/shared/models-movies';
import { MOVIES_MOCKS } from './movies.mocks';

const defaults = {
  name: 'Unnamed movie',
  isOnline: false,
} as Partial<MovieDto>;

const seqInt = (() => {
  let i = 0;
  return () => (++i).toString();
})();

const DEFAULT_STATE: MovieDto[] = MOVIES_MOCKS.map((e) => ({
  id: seqInt(),
  name: `${e.Title} (${e.Year})`,
  isOnline: false,
  pictureUrl: e.Poster,
}));

/**
 * Movies repo (mocked storage for movies).
 * - uses in-memory storage class for storing movies.
 * - follows immutability (all entities stored are cloned and cloned again on retrieval)
 * - defer with delay fns are used to simulate delay (defer - to postpone real function call)
 * @see InMemoryStorage
 */
@Injectable()
export class DataAccessMoviesService {
  private _store = new InMemoryStorage<string, MovieDto>({ keyProp: 'id' });

  constructor() {
    void this._store.hydrate(DEFAULT_STATE);
  }

  public getMovies(searchName: string): Observable<MovieDto[]> {
    return defer(() => this._store.search({ name: { $includes: searchName, caseSensitive: false } })).pipe(
      map((items) => items.map((e) => ({ ...e })))
    );
  }

  public addMovie(input: Omit<MovieDto, 'id'>): Observable<MovieDto> {
    const id = v4();
    const entity = { ...defaults, ...input, id };
    return defer(() => this._store.add(entity))
      .pipe(map(() => ({ ...entity })))
      .pipe(delay(1000));
  }

  public updateMovie(id: string, update: Partial<Omit<MovieDto, 'id'>>): Observable<MovieDto> {
    return defer(() => this._store.update(id, update))
      .pipe(map((res) => ({ ...res })))
      .pipe(delay(1000));
  }

  public updateOnline(ids: string[] | 'all', isOnline: boolean): Observable<MovieDto[]> {
    return defer(() => (ids !== 'all' ? of(ids) : this._store.getAllKeys()))
      .pipe(switchMap((keys) => combineLatest(keys.map((key) => this.updateMovie(key, { isOnline })))))
      .pipe(map((res) => res.map((item) => ({ ...item }))))
      .pipe(delay(1000));
  }

  public deleteMovie(id: string): Observable<void> {
    return defer(() => this._store.delete(id)).pipe(delay(1000));
  }
}
