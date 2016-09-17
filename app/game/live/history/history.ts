import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { GameModel } from '../../game.model';
import { GameService } from '../../game.service';
import { PlayerModel } from '../../players/players.model';

@Component({
  templateUrl: 'build/game/live/history/history.html'
})
export class GameHistory {

  game: GameModel;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private gameService: GameService
  ) {
    this.game = this.navParams.get('game');

    this.game.rounds.map(round => {
      round.player = this.game.getPlayerById(round.player_id);
      return round;
    });
  }

  public removeRound(round: any) {
    this.gameService.removeRound(this.game, round);
  }

}
