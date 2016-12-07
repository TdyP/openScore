import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class ErrorService {

  constructor(public toastCtrl: ToastController) {}

  /**
   * Handle errors
   * Always add error to console and display a message to user if provided, usings toasts
   *
   * @param {any} error   Error object
   * @param {String} msg  User friendly message
   */
  public handle(error: any, msg ?: string) {
    console.error(error);

    // If a message is provided, display it to user
    if(msg) {
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 7000,
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: '✕'
      });
      toast.present();
    }
  }
}
