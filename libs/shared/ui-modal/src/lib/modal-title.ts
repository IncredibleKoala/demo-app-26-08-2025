import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'ui-modal-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <ui-modal-close-button *ngIf="!closeButtonHide">
      <ng-container *ngIf="closeButtonText">{{ closeButtonText }}</ng-container>
      <ng-container *ngIf="!closeButtonText">
        <span>❌</span>
      </ng-container>
    </ui-modal-close-button>
  `,
  styleUrls: ['./shared.scss'],
  host: {
    class: 'shared-ui-modal--title',
  },
})
export class SharedUiModalTitleComponent {
  @Input()
  closeButtonHide = false;
  @Input()
  closeButtonText = '';
}
