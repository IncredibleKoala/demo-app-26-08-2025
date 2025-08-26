import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'ui-modal-sub-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-content /> `,
  styleUrls: ['./shared.scss'],
  host: {
    class: 'shared-ui-modal--sub-title',
  },
})
export class SharedUiModalSubtitleComponent {
  @Input()
  closeButtonHide = false;
  @Input()
  closeButtonText = '';
}
