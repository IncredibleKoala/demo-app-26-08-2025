import { inject, Injectable, Injector, TemplateRef } from '@angular/core';
import { Dialog, DialogConfig as CdkDialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { first, firstValueFrom, Observable, Subject } from 'rxjs';

export enum ModalSizes {
  Smaller = 'smaller',
  Small = 'small',
  Medium = 'medium',
  Wide = 'wide',
  Large = 'large',
  Auto = 'auto',
}

export interface DialogConfig<TData = any> extends CdkDialogConfig<TData> {
  modalSize?: ModalSizes;
  desiredHeightPx?: number;
  desiredWidthPx?: number;
}

/**
 * Modal sevice (wrapper for CDK modal service):
 * - hides default overrides for modals
 * - may provide various options (like extra sizing options, e.t.c.)
 * - handles injector substitution (in case when we need a dependency from component providers)
 */
@Injectable()
export class ModalService {
  private readonly injector = inject(Injector);
  private readonly cdkDialogService = inject(Dialog);

  openRef<T, D = any, R = any>(component: ComponentType<T>, config?: DialogConfig<D>): DialogRef<T, R>;
  openRef<T, D = any, R = any>(template: TemplateRef<T>, config?: DialogConfig<D>): DialogRef<T, R>;
  openRef<T, D = any, R = any>(template: ComponentType<T> | TemplateRef<T>, config?: DialogConfig<D>): DialogRef<T, R>;
  openRef<T, D = any, R = any>(templateOrAny: any, config?: DialogConfig<D>): DialogRef<T, R> {
    const configWithDefaults = { ...this.defaultModalConfig, ...config } as CdkDialogConfig;
    const ref = this.cdkDialogService.open(templateOrAny, configWithDefaults as any);
    ref.closed.pipe(first()).subscribe();
    return ref as DialogRef<T, R>;
  }

  open<T, D = any, R = any>(component: ComponentType<T>, config?: DialogConfig<D>): Observable<R>;
  open<T, D = any, R = any>(template: TemplateRef<T>, config?: DialogConfig<D>): Observable<R>;
  open<T, D = any, R = any>(template: ComponentType<T> | TemplateRef<T>, config?: DialogConfig<D>): Observable<R>;
  open<T, D = any, R = any>(templateOrAny: any, config?: DialogConfig<D>): Observable<R> {
    return this.openRef(templateOrAny, config).closed.pipe(first()) as Observable<R>;
  }

  openAsync<T, D = any, R = any>(component: ComponentType<T>, config?: DialogConfig<D>): Promise<R>;
  openAsync<T, D = any, R = any>(template: TemplateRef<T>, config?: DialogConfig<D>): Promise<R>;
  openAsync<T, D = any, R = any>(template: ComponentType<T> | TemplateRef<T>, config?: DialogConfig<D>): Promise<R>;
  openAsync<T, D = any, R = any>(templateOrAny: any, config?: DialogConfig<D>): Promise<R> {
    return firstValueFrom(this.open(templateOrAny, config)) as Promise<R>;
  }

  get openDialogs(): DialogRef<any>[] {
    return Array.from(this.cdkDialogService.openDialogs);
  }

  get afterOpened(): Subject<DialogRef<any>> {
    return this.cdkDialogService.afterOpened;
  }

  closeAll(): void {
    return this.cdkDialogService.closeAll();
  }

  getDialogById(id: string): DialogRef<any> | undefined {
    return this.cdkDialogService.getDialogById(id);
  }

  private get defaultModalConfig() {
    return {
      panelClass: 'modal-dialog',
      modalSize: ModalSizes.Auto,
      desiredHeightPx: undefined,
      desiredWidthPx: undefined,
      injector: this.injector,
    } as DialogConfig<any>;
  }
}
