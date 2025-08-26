import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@angular/cdk/dialog';
import { ModalService } from './modal.service';
import { SharedUiModalComponent } from './modal';
import { SharedUiModalTitleComponent } from './modal-title';
import { SharedUiModalBodyComponent } from './modal-body';
import { SharedUiModalActionsComponent } from './modal-actions';
import { SharedUiModalCloseButtonComponent } from './modal-close-button';
import { SharedUiModalSubtitleComponent } from './modal-subtitle';
import { ConfirmDialog } from './confirm.dialog';

const COMPONENTS = [
  //
  SharedUiModalComponent,
  SharedUiModalSubtitleComponent,
  SharedUiModalTitleComponent,
  SharedUiModalBodyComponent,
  SharedUiModalActionsComponent,
  SharedUiModalCloseButtonComponent,
  ConfirmDialog,
];

@NgModule({
  imports: [CommonModule, DialogModule],
  providers: [ModalService],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class SharedUiModalModule {}
