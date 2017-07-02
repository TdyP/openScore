import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";
import _ from 'lodash';

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
  origGame: GameModel;
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

    this.origGame = this.navParams.get('game');
    if(!this.origGame) {
      this.origGame = new GameModel();
      this.gameService.getGame()
        .then(game => {
          this.origGame = game
        })
        .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.load_game')));
    }

    // Duplicate the game to be able to cancel modifications if user hit back button
    this.game = _.cloneDeep(this.origGame);

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
            // On this case, we just pop this page from the nav so we need to manually update live page data
            Object.assign(this.origGame,this.game);
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

  /**
   * Return available options for game end.
   * Options depends on score input type, so we can't simple ion-options in template.
   *
   * @return {Array<any>} List of options
   */
  public getEndGameOptions(): Array<any> {
    let options = [
      {
        title: this.translateService.instant('settings.end_never'),
        value: 'none'
      },
      {
        title: this.translateService.instant('settings.end_score'),
        value: 'score'
      }
    ];

    if(this.game.score_input === 'round') {
      options.push({
        title: this.translateService.instant('settings.end_rounds'),
        value: 'rounds'
      });
    }

    return options;
  }
}
