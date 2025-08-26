import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Common card component (not actually needed but implemented according to requested specification)
 */
@Component({
  standalone: true,
  selector: 'ui-card',
  styleUrls: ['./shared-ui-card.component.scss'],
  templateUrl: './shared-ui-card.component.html',
  imports: [CommonModule],
})
export class SharedUiCardComponent {
  @ViewChild('image')
  public image!: ElementRef<HTMLElement>;

  @ViewChild('header')
  public header!: ElementRef<HTMLElement>;

  @ViewChild('body')
  public body!: ElementRef<HTMLElement>;

  @ViewChild('actions')
  public actions!: ElementRef<HTMLElement>;

  // can be used to switch block visibility (but not used since mutation observer implementation required)
  public get imageHasContent(): boolean {
    return !!(this.image?.nativeElement?.innerHTML ?? '');
  }

  // can be used to switch block visibility (but not used since mutation observer implementation required)
  public get headerHasContent(): boolean {
    return !!(this.header?.nativeElement?.innerHTML ?? '');
  }

  // can be used to switch block visibility (but not used since mutation observer implementation required)
  public get bodyHasContent(): boolean {
    return !!(this.body?.nativeElement?.innerHTML ?? '');
  }

  // can be used to switch block visibility (but not used since mutation observer implementation required)
  public get actionsHaveContent(): boolean {
    return !!(this.actions?.nativeElement?.innerHTML ?? '');
  }
}
