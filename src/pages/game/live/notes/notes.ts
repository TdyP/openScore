import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

import { ErrorService } from '../../../../providers/error.service';
import { GameModel } from '../../../../providers/game/game.model';
import { GameService } from '../../../../providers/game/game.service';

@Component({
  selector: 'page-game-notes',
  templateUrl: 'notes.html'
})
export class GameNotes {

  game: GameModel;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private translateService: TranslateService,
    private gameService: GameService,
    private errorServ: ErrorService
  ) {
    this.game = this.navParams.get('game');
  }

  public validate() {
    var loading = this.loadingCtrl.create({
      content: this.translateService.instant('loading')
    });
    loading.present();

    this.gameService.saveGame(this.game)
    .then(() => {
      loading.dismiss();

      return this.navCtrl.pop();
    })
    .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
  }

}
