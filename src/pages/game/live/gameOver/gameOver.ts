import { Component } from '@angular/core';
import { NavParams, ViewController, Events } from 'ionic-angular';

import { GameModel } from '../../../../providers/game/game.model';
import { PlayerModel } from '../../../../providers/player/player.model';
import { SortByScorePipe } from '../../../../pipes/sortByScore.pipe';

@Component({
  selector: 'page-game-over',
  templateUrl: 'gameOver.html'
})
export class GameOverModal {

  game: GameModel;
  winner: PlayerModel;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private events: Events,
    private sortPipe: SortByScorePipe
  ) {
    this.game = this.navParams.get('game');

    let players = sortPipe.transform(this.game.players, this.game.score_input, true);
    this.winner = players[0];
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

  public startNewGame() {
    this.events.publish(`game:${this.game.id}:new_game`, {game: this.game});
    this.dismiss();
  }

}
