import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PlayersService } from '../../game/players/players.service';
import { PlayerModel } from '../../game/players/players.model';

@Component({
  templateUrl: 'build/players/view/view.html'
})
export class PlayersView {
  player: PlayerModel;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private playerService: PlayersService
  ) {
    this.player = this.navParams.get('player');
    this.playerService.loadPlayerStats(this.player);
  }
}
