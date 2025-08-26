import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone,
  standalone: false,
  selector: 'ui-modal-actions',
  template: '<ng-content />',
  styleUrls: ['./shared.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'shared-ui-modal--actions',
  },
})
export class SharedUiModalActionsComponent {}
