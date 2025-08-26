import { ChangeDetectionStrategy, Component, HostBinding, Optional } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogConfig, ModalSizes } from './modal.service';

@Component({
  standalone: false,
  selector: 'ui-modal',
  template: '<ng-content />',
  styleUrls: ['./shared.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedUiModalComponent {
  constructor(@Optional() private readonly ref: DialogRef) {}

  @HostBinding('style.width.px')
  get desiredWidthPx() {
    return this.config?.desiredWidthPx;
  }

  @HostBinding('style.height.px')
  get desiredHeightPx() {
    return this.config?.desiredHeightPx;
  }

  @HostBinding('class')
  get classList() {
    return {
      'shared-ui-modal': true,
      [this.sizeClass]: true,
    };
  }

  get sizeClass() {
    switch (this.modalSize) {
      case ModalSizes.Wide:
        return 'shared-ui-modal--w-wide';
      case ModalSizes.Large:
        return 'shared-ui-modal--w-large';
      case ModalSizes.Medium:
        return 'shared-ui-modal--w-medium';
      case ModalSizes.Small:
        return 'shared-ui-modal--w-small';
      case ModalSizes.Smaller:
        return 'shared-ui-modal--w-smaller';
      default:
        return 'shared-ui-modal--w-auto';
    }
  }

  get modalSize() {
    return this.config?.modalSize;
  }

  get config(): DialogConfig {
    return this.ref?.config as DialogConfig;
  }
}
