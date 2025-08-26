import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { SharedUiModalModule } from '@demo-app/shared/ui-modal';
import { combineLatest, lastValueFrom, map, Subject, takeUntil } from 'rxjs';
import { MovieDto } from '@demo-app/shared/models-movies';
import { MoviesStore } from '../../../feature-main/src/lib/+state/movies.store';

export interface MoviesFeatureCreateMovieDialogComponentData {
  movie?: MovieDto;
}

export type MoviesFeatureCreateMovieDialogComponentResult = MovieDto | null;

/**
 * Dialog to add or edit movies.
 */
@Component({
  selector: 'lib-movies-feature-add-movie-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SharedUiModalModule, ReactiveFormsModule],
  templateUrl: './feature-create-movie-dialog.component.html',
  styleUrls: ['./feature-create-movie-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesFeatureCreateMovieDialogComponent implements OnInit, OnDestroy {
  private readonly data = inject(DIALOG_DATA) as MoviesFeatureCreateMovieDialogComponentData;
  private readonly store = inject(MoviesStore);
  public readonly dialogRef = inject(DialogRef);

  public readonly destroyed$ = new Subject<void>();

  public readonly isBusy$ = combineLatest([this.store.createInProgress$, this.store.updateInProgress$]).pipe(
    map(([a, b]) => a || b)
  );

  public readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    isOnline: new FormControl(false, {
      nonNullable: true,
      validators: [],
    }),
  });

  public get isEdit(): boolean {
    return !!this.data.movie?.id;
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public ngOnInit(): void {
    this.form.patchValue({
      name: this.data.movie?.name ?? '',
      isOnline: this.data.movie?.isOnline ?? false,
    });
    this.isBusy$.pipe(takeUntil(this.destroyed$)).subscribe((busy) => {
      if (busy) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  public onCancelButtonClicked(): void {
    this.dialogRef.close();
  }

  public async onSaveButtonClicked(): Promise<void> {
    const update = {
      name: this.form.controls.name.value,
      isOnline: this.form.controls.isOnline.value,
    };
    let movie: MovieDto;
    if (this.data.movie?.id) {
      movie = await lastValueFrom(this.store.updateMovie(this.data.movie.id, update));
    } else {
      movie = await lastValueFrom(this.store.addMovie(update));
    }
    this.dialogRef.close(movie);
  }
}
