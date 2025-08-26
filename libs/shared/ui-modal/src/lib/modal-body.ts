import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'ui-modal-body',
  template: '<ng-content />',
  styleUrls: ['./shared.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'shared-ui-modal--body',
  },
})
export class SharedUiModalBodyComponent {}
