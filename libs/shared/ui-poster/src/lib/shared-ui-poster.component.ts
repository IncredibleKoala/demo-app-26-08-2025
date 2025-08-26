import { Component, HostBinding, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * Component for displaying images with fallback options.
 */
@Component({
  standalone: true,
  selector: 'ui-poster',
  styleUrls: ['./shared-ui-poster.component.scss'],
  templateUrl: './shared-ui-poster.component.html',
  imports: [NgOptimizedImage],
})
export class SharedUiPosterComponent {
  @Input()
  src?: string;

  @Input()
  width?: number;

  @Input()
  height?: number;

  @Input()
  alt?: string;

  @Input()
  title?: string;

  @Input()
  variant: 'normal' | 'rounded' | 'circle' = 'normal';

  @Input()
  fallbackSrc = '/images/no-image.jpg';

  @HostBinding('class') get classList() {
    const classes: string[] = [];
    classes.push(this.variant);
    return classes.join(' ');
  }

  public loadingFailed = false;

  public onError() {
    this.loadingFailed = true;
  }
}
