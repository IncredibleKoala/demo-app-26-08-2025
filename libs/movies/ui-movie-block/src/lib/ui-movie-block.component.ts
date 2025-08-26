import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieDto } from '@demo-app/shared/models-movies';
import { SharedUiPosterComponent } from '@demo-app/shared/ui-poster';
import { SharedUiCardComponent } from '@demo-app/shared/ui-card';

@Component({
  selector: 'lib-ui-movie-block',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedUiPosterComponent, SharedUiCardComponent],
  templateUrl: './ui-movie-block.component.html',
  styleUrls: ['./ui-movie-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesUiMovieBlockComponent {
  @Input()
  public movie!: MovieDto;

  @Output()
  deleteButtonClicked = new EventEmitter<MovieDto>();

  @Output()
  editButtonClicked = new EventEmitter<MovieDto>();

  public onDeleteButtonClicked(): void {
    this.deleteButtonClicked.next(this.movie);
  }

  public onEditButtonClicked(): void {
    this.editButtonClicked.next(this.movie);
  }
}
