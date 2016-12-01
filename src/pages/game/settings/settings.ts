import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from "ng2-translate/ng2-translate";

import { ErrorService } from '../../../providers/error.service';
import { GameService } from '../../../providers/game/game.service';
import { GameModel } from '../../../providers/game/game.model';
import { GamePlayers } from '../players/players';

@Component({
  selector: 'page-game-settings',
  templateUrl: 'settings.html'
})
export class GameSettings {

  game: GameModel;
  fromGameMenu: boolean;
  goal_enabled: boolean;
  previousGames: any;
  selectedGame: GameModel;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private errorServ: ErrorService,
    private translateService: TranslateService,
    private gameService: GameService
  ) {
    this.gameService = gameService;
    this.fromGameMenu = this.navParams.get('fromGameMenu');

    this.game = this.navParams.get('game');
    if(!this.game) {
      this.game = new GameModel();
      this.gameService.getGame()
        .then(game => {
          this.game = game
        })
        .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.load_game')));
    }

    this.goal_enabled = false;
    this.previousGames = [];
  }

  ionViewWillEnter() {
    this.gameService.getPreviousGamesSettings()
      .then(games => {
        this.previousGames = games;
      })
      .catch(err => this.errorServ.handle(err));
  }

  validate() {
    if(!this.game.id) { // New game => load players view
      this.navCtrl.push(GamePlayers, {game: this.game});
    }
    else { // Existing game => go back to live view
      var loading = this.loadingCtrl.create({
        content: this.translateService.instant('loading')
      });
      loading.present();

      this.gameService.saveGame(this.game)
        .then(() => {
          loading.dismiss();

          if(this.fromGameMenu) {
            return this.navCtrl.pop();
          }
          else {
            return this.navCtrl.push(GamePlayers, {game: this.game});
          }
        })
        .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
    }
  }

  public gameSelected() {
    delete this.selectedGame.id;
    delete this.selectedGame.start_date;
    delete this.selectedGame.modif_date;
    this.game = new GameModel(this.selectedGame);
  }
}
