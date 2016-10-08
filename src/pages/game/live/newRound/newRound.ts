import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { GameModel } from '../../../../providers/game/game.model';
import { GameService } from '../../../../providers/game/game.service';

@Component({
  selector: 'page-new-round',
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
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

  public validate() {
    for(let key of Object.keys(this.scores)) {
      let score = this.scores[key];
      this.gameService.updateScore(this.game, score.player, (score.points || 0));
    }
    this.viewCtrl.dismiss();
  }

}
