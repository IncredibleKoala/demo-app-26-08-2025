import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DataAccessMoviesService } from '@demo-app/shared/data-access-movies-service';
import { combineLatest, map, Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoviesUiMovieBlockComponent } from '@demo-app/movies-ui-movie-block';
import {
  MoviesFeatureCreateMovieDialogComponent,
  MoviesFeatureCreateMovieDialogComponentResult,
} from '@demo-app/movies-feature-add-movie-dialog';
import { ConfirmDialog, ConfirmDialogData, ModalService, SharedUiModalModule } from '@demo-app/shared/ui-modal';
import { SharedUiPageHeaderComponent } from '@demo-app/shared/ui-page-header';
import { MovieDto } from '@demo-app/shared/models-movies';
import { MovieFilters, MoviesStore } from './+state/movies.store';

/**
 * Entrypoint component of "movies" module.
 */
@Component({
  selector: 'lib-feature-movies-main',
  standalone: true,
  imports: [CommonModule, FormsModule, MoviesUiMovieBlockComponent, SharedUiModalModule, SharedUiPageHeaderComponent],
  templateUrl: './feature-main.component.html',
  styleUrls: ['./feature-main.component.scss'],
  providers: [MoviesStore, DataAccessMoviesService, ModalService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesFeatureMainComponent implements OnDestroy, OnInit {
  private readonly store = inject(MoviesStore);
  private readonly modalService = inject(ModalService);
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChildren(MoviesUiMovieBlockComponent, { read: ElementRef })
  public readonly movies!: QueryList<ElementRef<HTMLElement>>;

  private readonly destroyed$ = new Subject<void>();

  public readonly movies$ = this.store.movies$;
  public readonly filters$ = this.store.filters$;
  public readonly busy$ = combineLatest([
    this.store.deleteInProgress$,
    this.store.updateInProgress$,
    this.store.createInProgress$,
    this.store.loading$,
    this.store.bulkUpdateInProgress$,
  ]).pipe(map((e) => e.some(Boolean)));

  public ngOnInit(): void {
    this.store.loadMovies();
  }

  public onFilterChange($event: Partial<MovieFilters>): void {
    this.store.patchFilter($event);
  }

  public onSetOnlineClicked(): void {
    this.openConfirmSetAllOnlineDialog();
  }

  public onDeleteButtonClicked(movie: MovieDto): void {
    this.openConfirmDeleteDialog(movie);
  }

  public onCreateMovieClicked(): void {
    this.openCreateMovieDialog(null).subscribe((res: MoviesFeatureCreateMovieDialogComponentResult) => {
      if (res) {
        this.cdr.detectChanges(); // update visuals first
        this.scrollToId(res.id);
      }
    });
  }

  public onEditButtonClicked(movie: MovieDto): void {
    this.openCreateMovieDialog(movie).subscribe((res: MoviesFeatureCreateMovieDialogComponentResult) => {
      if (res) {
        this.scrollToId(res.id);
      }
    });
  }

  private scrollToId(id: string) {
    const el = this.movies.find((el) => el.nativeElement.getAttribute('data-id') === id);
    el?.nativeElement?.scrollIntoView();
  }

  private openCreateMovieDialog(movieToEditOrNull: MovieDto | null): Observable<any> {
    return this.modalService.open(MoviesFeatureCreateMovieDialogComponent, {
      maxWidth: '80vw',
      minWidth: '320px',
      data: { movie: movieToEditOrNull },
    });
  }

  private openConfirmDeleteDialog(movie: MovieDto): Observable<any> {
    return this.modalService.open(ConfirmDialog, {
      maxWidth: '80vw',
      minWidth: '320px',
      data: {
        title: 'Are you sure?',
        body: `You are going to delete "${movie.name} from database. Do you want to continue?"`,
        okAction: () => this.store.deleteMovie(movie.id),
      } as ConfirmDialogData,
    });
  }

  private openConfirmSetAllOnlineDialog(): Observable<any> {
    return this.modalService.open(ConfirmDialog, {
      maxWidth: '80vw',
      minWidth: '320px',
      data: {
        title: 'Are you sure?',
        body: `You are going to mark all movies as online. Do you want to continue?`,
        okAction: () => this.store.bulkUpdateOnline('all', true),
      } as ConfirmDialogData,
    });
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
