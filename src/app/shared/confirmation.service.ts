import { Injectable, signal } from '@angular/core';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private isVisible = signal(false);
  private confirmationData = signal<ConfirmationData | null>(null);
  private resolvePromise: ((result: boolean) => void) | null = null;

  getVisibility() {
    return this.isVisible.asReadonly();
  }

  getData() {
    return this.confirmationData.asReadonly();
  }

  confirm(data: ConfirmationData): Promise<boolean> {
    this.confirmationData.set({
      ...data,
      confirmText: data.confirmText || 'Confirm',
      cancelText: data.cancelText || 'Cancel',
      type: data.type || 'warning'
    });
    this.isVisible.set(true);

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  handleConfirm() {
    this.isVisible.set(false);
    if (this.resolvePromise) {
      this.resolvePromise(true);
      this.resolvePromise = null;
    }
  }

  handleCancel() {
    this.isVisible.set(false);
    if (this.resolvePromise) {
      this.resolvePromise(false);
      this.resolvePromise = null;
    }
  }
}