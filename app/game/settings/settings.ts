import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { GameService } from '../game.service';
import { GamePlayers } from '../players/players';
import { GameLive } from '../live/live';
import { GameModel } from '../game.model';

@Component({
  templateUrl: 'build/game/settings/settings.html'
})
export class GameSettings {

  game: GameModel;
  goal_enabled: boolean;
  gameService: GameService;
  previousGames: any;
  selectedGame: GameModel;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    gameService: GameService
  ) {
    this.gameService = gameService;

    this.game = this.navParams.get('game');
    if(!this.game) {
      this.game = new GameModel();
      this.gameService.getGame()
        .then(game => {
          this.game = game
        });
    }

    this.goal_enabled = false;
    this.previousGames = [];
  }

  ionViewWillEnter() {
    this.gameService.getPreviousGamesSettings()
      .then(games => {
        this.previousGames = games;
      });
  }

  validate() {
    if(!this.game.id) { // New game => load players view
      this.navCtrl.push(GamePlayers, {game: this.game});
    }
    else { // Existing game => go back to live view
      this.gameService.saveGame(this.game)
        .then(() => this.navCtrl.pop())
        .catch(console.log);
    }
  }

  public gameSelected() {
    delete this.selectedGame.id;
    delete this.selectedGame.start_date;
    delete this.selectedGame.modif_date;
    this.game = new GameModel(this.selectedGame);
  }
}
