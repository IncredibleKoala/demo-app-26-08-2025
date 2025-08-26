import { MovieDto } from '@demo-app/shared/models-movies';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  Observable,
  shareReplay,
  Subject,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { DataAccessMoviesService } from '@demo-app/shared/data-access-movies-service';

export interface MovieFilters {
  search: string;
}

function omit<T>(t: T, prop: keyof T): T {
  t = { ...t };
  delete t[prop];
  return t;
}

@Injectable()
export class MoviesStore {
  private readonly dataAccessMoviesService = inject(DataAccessMoviesService);

  private readonly destroyed$ = new Subject<void>();
  private readonly _filters$ = new BehaviorSubject<MovieFilters>({ search: '' });
  private readonly _movies$ = new BehaviorSubject<MovieDto[]>([]);
  private readonly _loading$ = new BehaviorSubject(false);
  private readonly _loaded$ = new BehaviorSubject(false);
  private readonly _error$ = new BehaviorSubject<any>(null);
  private readonly _bulkUpdateInProgress$ = new BehaviorSubject<boolean>(false);
  private readonly _deleteInProgress$ = new BehaviorSubject<boolean>(false);
  private readonly _createInProgress$ = new BehaviorSubject<boolean>(false);
  private readonly _updateInProgress$ = new BehaviorSubject<boolean>(false);

  public readonly filters$ = this._filters$.asObservable();
  public readonly movies$ = this._movies$.asObservable();
  public readonly loading$ = this._loading$.asObservable();
  public readonly loaded$ = this._loaded$.asObservable();
  public readonly error$ = this._error$.asObservable();
  public readonly bulkUpdateInProgress$ = this._bulkUpdateInProgress$.asObservable();
  public readonly deleteInProgress$ = this._deleteInProgress$.asObservable();
  public readonly createInProgress$ = this._createInProgress$.asObservable();
  public readonly updateInProgress$ = this._updateInProgress$.asObservable();

  private readonly otherFilters$ = this.filters$.pipe(map((e) => omit(e, 'search')));
  private readonly searchFilter$ = this.filters$.pipe(
    debounceTime(500),
    map((e) => (e?.search || '').trim()),
    map((e) => (e.length >= 3 ? e : '')),
    distinctUntilChanged()
  );

  private readonly loadingEffect$ = combineLatest([this.searchFilter$, this.otherFilters$])
    .pipe(debounceTime(0), takeUntil(this.destroyed$))
    .subscribe(([search, other]) => {
      this._fetchMovies({ ...other, search: search });
    });

  public destroy(): void {
    this._filters$.complete();
    this._movies$.complete();
    this._loading$.complete();
    this._loaded$.complete();
    this._error$.complete();
    this._bulkUpdateInProgress$.complete();
    this._deleteInProgress$.complete();
    this._updateInProgress$.complete();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public setFilter(filter: MovieFilters): void {
    this._filters$.next(filter);
  }

  public patchFilter(update: Partial<MovieFilters>): void {
    this._filters$.next({ ...this._filters$.getValue(), ...update });
  }

  public bulkUpdateOnline(ids: string[] | 'all', isOnline: boolean): Observable<void> {
    return this._bulkUpdateOnline(ids, isOnline);
  }

  public deleteMovie(movieId: string): Observable<void> {
    return this._deleteMovie(movieId);
  }

  public addMovie(movieId: Omit<MovieDto, 'id'>): Observable<MovieDto> {
    return this._addMovie(movieId);
  }

  public updateMovie(movieId: string, update: Omit<MovieDto, 'id'>): Observable<MovieDto> {
    return this._updateMovie(movieId, update);
  }

  public loadMovies(): Observable<void> {
    return this._fetchMovies(this._filters$.getValue());
  }

  public _updateMovie(movieId: string, update: Omit<MovieDto, 'id'>): Observable<MovieDto> {
    this._updateInProgress$.next(true);
    const obs$ = this.dataAccessMoviesService.updateMovie(movieId, update).pipe(
      catchError((err) => {
        this._error$.next(err);
        return throwError(() => err);
      }),
      finalize(() => this._updateInProgress$.next(false)),
      tap((res) => {
        const updated = this._movies$.getValue().map((e) => (e.id === movieId ? res : e));
        this._movies$.next(updated);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      takeUntil(this.destroyed$)
    );
    obs$.subscribe();
    return obs$;
  }

  public _addMovie(movie: Omit<MovieDto, 'id'>): Observable<MovieDto> {
    this._createInProgress$.next(true);
    const obs$ = this.dataAccessMoviesService.addMovie(movie).pipe(
      catchError((err) => {
        this._error$.next(err);
        return throwError(() => err);
      }),
      finalize(() => this._createInProgress$.next(false)),
      tap((res) => {
        const updated = this._movies$.getValue().concat([res]);
        this._movies$.next(updated);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      takeUntil(this.destroyed$)
    );
    obs$.subscribe();
    return obs$;
  }

  public _bulkUpdateOnline(ids: string[] | 'all', isOnline: boolean): Observable<any> {
    this._bulkUpdateInProgress$.next(true);
    const obs$ = this.dataAccessMoviesService.updateOnline(ids, isOnline).pipe(
      catchError((err) => {
        this._error$.next(err);
        return throwError(() => err);
      }),
      finalize(() => this._bulkUpdateInProgress$.next(false)),
      tap((updatedMovies) => {
        const updatedMoviesMap = new Map(updatedMovies.map((e) => [e.id, e]));
        const updated = this._movies$.getValue().map((e) => updatedMoviesMap.get(e.id) ?? e);
        this._movies$.next(updated);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      takeUntil(this.destroyed$)
    );
    obs$.subscribe();
    return obs$;
  }

  public _deleteMovie(movieId: string): Observable<any> {
    this._deleteInProgress$.next(true);
    const obs$ = this.dataAccessMoviesService.deleteMovie(movieId).pipe(
      catchError((err) => {
        this._error$.next(err);
        return throwError(() => err);
      }),
      finalize(() => this._deleteInProgress$.next(false)),
      tap(() => {
        const updated = this._movies$.getValue().slice();
        const index = updated.findIndex((x) => x.id === movieId);
        if (index >= 0) {
          updated.splice(index, 1);
        }
        this._movies$.next(updated);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      takeUntil(this.destroyed$)
    );
    obs$.subscribe();
    return obs$;
  }

  private _fetchMovies(filter: MovieFilters): Observable<any> {
    this._loading$.next(true);
    const obs$ = this.dataAccessMoviesService.getMovies(filter.search).pipe(
      tap((data) => {
        this._error$.next(null);
        this._loaded$.next(true);
        this._movies$.next(data);
      }),
      catchError((err) => {
        this._error$.next(err);
        return throwError(() => err);
      }),
      finalize(() => this._loading$.next(false)),
      shareReplay({ bufferSize: 1, refCount: false }),
      takeUntil(this.destroyed$)
    );
    obs$.subscribe();
    return obs$;
  }
}
