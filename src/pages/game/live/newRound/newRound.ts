import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { ErrorService } from '../../../../providers/error.service';
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
    private navCtrl: NavController,
    private navParams: NavParams,
    private translateService: TranslateService,
    private viewCtrl: ViewController,
    private gameService: GameService,
    private errorServ: ErrorService
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
    let ids = Object.keys(this.scores);
    let scoresLength = ids.length;

    let promises = [];
    for(let i = 0; i < scoresLength; i++) {
      let score = this.scores[ids[i]];
      promises.push(this.gameService.updateScore(this.game, score.player, (score.points || 0), true));
    }

    Promise.all(promises)
      .then(() => {
        this.gameService.publishGameScoreUpdate(this.game);
      })
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));

    this.viewCtrl.dismiss();
  }

}
