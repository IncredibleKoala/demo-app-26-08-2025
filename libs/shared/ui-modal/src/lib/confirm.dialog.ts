import { ChangeDetectionStrategy, Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BehaviorSubject, finalize, Observable, Subject, takeUntil } from 'rxjs';

export interface ConfirmDialogData {
  customTitle?: TemplateRef<any>;
  customBody?: TemplateRef<any>;
  customActions?: TemplateRef<any>;
  title?: string;
  body?: string;
  okAction?: () => Observable<any>; // return NEVER to block "close" action.
}

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'ui-confirm-dialog',
  templateUrl: './confirm.dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog implements OnDestroy {
  public readonly data = inject(DIALOG_DATA) as ConfirmDialogData;
  public readonly dialogRef = inject(DialogRef);

  private readonly destroyed$ = new Subject<void>();

  public readonly actionInProgress$ = new BehaviorSubject<boolean>(false);

  public ngOnDestroy(): void {
    this.actionInProgress$.complete();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public onCancelClicked(): void {
    this.dialogRef.close(true);
  }

  public onConfirmClicked(): void {
    if (this.data.okAction) {
      this.actionInProgress$.next(true);
      this.data
        .okAction()
        .pipe(
          finalize(() => this.actionInProgress$.next(false)),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => this.dialogRef.close(true));
    } else {
      this.dialogRef.close(true);
    }
  }
}
