import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { ErrorService } from '../../../providers/error.service';
import { GameModel } from '../../../providers/game/game.model';
import { GameService } from '../../../providers/game/game.service';
import { PlayerService } from '../../../providers/player/player.service';

import { GameLive } from '../live/live';

@Component({
  selector: 'page-game-players',
  templateUrl: 'players.html'
})
export class GamePlayers {

  game: GameModel;
  allPlayers: any;
  selectedPlayers: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private translateService: TranslateService,
    private PlayerService: PlayerService,
    private gameService: GameService,
    private errorServ: ErrorService
  ){
    this.game = this.navParams.get('game');
    this.selectedPlayers = [];
  }

  ionViewWillEnter() {
    if (!this.game.players.length) {
      this.defineNumber();
    }

    this.PlayerService.getAllPlayers()
      .then(players => {
        this.allPlayers = players;
      })
      .catch(err => this.errorServ.handle(err));
  }

  public addPlayer() {
    this.generatePlayers(this.game.players.length + 1);
  }

  public defineNumber() {
    let alert = this.alertCtrl.create({
      title: this.translateService.instant('players.number'),
      inputs: [
        {
          name: 'playersNumber',
          type: 'number',
          value: String(this.game.players.length || '')
        },
      ],
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: this.translateService.instant('ok'),
          handler: data => {
            let playersNumber = data.playersNumber;

            if (playersNumber !== '') {
              this.generatePlayers(playersNumber);
            }
          }
        }
      ]
    });
    alert.present();
  }

  public playerSelected(index) {
    let selection = this.selectedPlayers[index];

    if (selection.id) {
      this.game.players[index].id = selection.id;
      this.game.players[index].name = selection.name;
      this.game.players[index].selectable = selection.selectable;
    }
    else {
      delete this.game.players[index].id;
      this.game.players[index].name = this.getDefaultName(index + 1);
    }
  }

  public setPlayerSelectable(player) {
    player.selectable = true;
  }

  public removePlayer(player) {
    let self = this;
    let doRemove = function() {
      self.gameService.removePlayer(self.game, player);
    }

    if(this.game.id && player.id) {
      this.alertCtrl.create({
        title: this.translateService.instant('players.remove_confirm_title'),
        message: this.translateService.instant('players.remove_confirm_msg'),
        buttons: [
          {
            text: this.translateService.instant('cancel')
          },
          {
            text: 'OK',
            handler: () => {
              doRemove();
            }
          }
        ]
      })
      .present();
    }
    else {
      doRemove();
    }
  }

  public validate() {
    var loading = this.loadingCtrl.create({
      content: this.translateService.instant('loading')
    });
    loading.present();

    if(!this.game.id) { // New game => save full and go to live view
      this.gameService.saveGame(this.game)
      .then(() => this.gameService.saveGamePlayers(this.game))
      .then(() => this.navCtrl.push(GameLive, {game: this.game, loading}))
      .then(() => this.navCtrl.remove(1,2)) // Remove settings pages from nav
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
    }
    else { // Existing game => update players and go back to live view
      this.gameService.saveGamePlayers(this.game)
      .then(() => {
        loading.dismiss();
        this.navCtrl.pop()
      })
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
    }
  }

  public generatePlayers(playersNumber: number) {
    let existingPlayersCount = this.game.players.length;

    if (existingPlayersCount < playersNumber) {
      let numberToGenerate = playersNumber - existingPlayersCount;
      for(let i = 0; i < numberToGenerate; i++) {
        let name = this.getDefaultName(existingPlayersCount + (i + 1));
        this.game.addPlayer({name}, playersNumber);
      }
    }
    else {
      this.game.players = this.game.players.slice(0, playersNumber);
    }

  }

  public getDefaultName(index) {
    return this.translateService.instant('players.default_name', {index})
  }
}
