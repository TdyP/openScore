import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PlayerService } from '../../../providers/player/player.service';
import { PlayerModel } from '../../../providers/player/player.model';

@Component({
  templateUrl: 'view.html'
})
export class PlayersView {
  player: PlayerModel;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public playerService: PlayerService
  ) {
    this.player = this.navParams.get('player');
    this.playerService.loadPlayerStats(this.player);
  }
}
