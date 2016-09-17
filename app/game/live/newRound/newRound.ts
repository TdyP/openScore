import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { GameModel } from '../../game.model';
import { GameService } from '../../game.service';

@Component({
  templateUrl: 'build/game/live/newRound/newRound.html'
})
export class NewRoundModal {

  game: GameModel;
  scores: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private gameService: GameService
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
