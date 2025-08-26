import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'ui-modal-close-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="" *ngIf="showClose" tabindex="0" (click)="onCloseClicked()" (keydown.enter)="onCloseClicked()">
      <ng-content />
    </div>
  `,
  styleUrls: ['./shared.scss'],
  host: {
    class: 'shared-ui-modal--close-button',
  },
})
export class SharedUiModalCloseButtonComponent {
  public readonly dialogRef = inject(DialogRef);

  @Input()
  showClose = true;

  public onCloseClicked(): void {
    this.dialogRef.close();
  }
}
