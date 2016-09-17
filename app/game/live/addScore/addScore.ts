import {Component} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
  templateUrl: 'build/game/live/addScore/addScore.html'
})
export class AddScoreModal {

  constructor(
      public params: NavParams,
      public viewCtrl: ViewController
  ) {}

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
