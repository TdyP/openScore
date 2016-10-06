import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { GameModel } from '../../../../providers/game/game.model';
import { GameService } from '../../../../providers/game/game.service';

@Component({
  templateUrl: 'newRound.html'
})
export class NewRoundModal {

  game: GameModel;
  scores: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public gameService: GameService
  ) {
    this.game = this.navParams.get('game');

    this.scores = {};
    for(let player of this.game.players) {
      this.scores[player.id] = {
        player
      }
    }

    console.log('scores before', this.scores);
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

  public validate() {
    for(let key of Object.keys(this.scores)) {
      let score = this.scores[key];
      this.gameService.updateScore(this.game, score.player, (score.points || 0));
    }
    console.log('game jupdate', this.game);
    this.viewCtrl.dismiss();
  }

}
