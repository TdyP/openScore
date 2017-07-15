import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { PlayerModel } from '../../../../providers/player/player.model';
import { PlayerService } from '../../../../providers/player/player.service';

@Component({
  selector: 'color-picker-popover',
  templateUrl: 'colorPickerPopover.html'
})
export class ColorPickerPopover {

  player: PlayerModel;
  availableColors: [string];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private translateService: TranslateService,
    private playerService: PlayerService,
    private viewCtrl: ViewController
  ) {
    this.player = this.navParams.get('player');
    this.availableColors = this.player.getAvailableColors()
      .sort((a, b) => a === this.player.color ? -1 : 1)
  }

  public setColor(color) {
    this.player.color = color;
    this.viewCtrl.dismiss();
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}
