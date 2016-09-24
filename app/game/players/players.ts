import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
// import { ColorPickerDirective } from 'angular2-color-picker';

import { GameModel } from '../game.model';
import { GameService } from '../game.service';
import { GameLive } from '../live/live';
import { PlayersService } from './players.service';
import { PlayerModel } from './players.model';
import { AvailablePlayersPipe } from './availablePlayers.pipe';

@Component({
  templateUrl: 'build/game/players/players.html',
  pipes: [AvailablePlayersPipe],
  // directives: [ColorPickerDirective]
})
export class GamePlayers {

  game: GameModel;
  allPlayers: any;
  selectedPlayers: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private playersService: PlayersService,
    private gameService: GameService
  ){
    this.game = this.navParams.get('game');
    this.selectedPlayers = [];
  }

    public color: string = "#127bdc";

  ionViewWillEnter() {
    if (!this.game.players.length) {
      this.defineNumber();
    }

    this.playersService.getAllPlayers()
      .then(players => {
        this.allPlayers = players;
      });
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
    let currentScore = this.game.players[index].score;
    console.log('currentScore', currentScore);
    if (selection.id) {
      this.game.players[index] = new PlayerModel(selection);
    }
    else {
      delete this.game.players[index].id;
      this.game.players[index].name = this.getDefaultName(index + 1);
    }
    this.game.players[index].score = currentScore;
    console.log('playerscore', this.game.players[index].score);
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
    if(!this.game.id) { // New game => save full and go to live view
      this.gameService.saveGame(this.game)
      .then(() => this.gameService.saveGamePlayers(this.game))
      .then(() => this.navCtrl.push(GameLive, {game: this.game}))
      .then(() => this.navCtrl.remove(1,2)) // Remove settings pages from nav
      .catch(console.log);
    }
    else { // Existing game => update players and go back to live view
      this.gameService.saveGamePlayers(this.game)
      .then(() => this.navCtrl.pop())
      .catch(console.log);
    }
  }

  private generatePlayers(playersNumber: number) {
    let existingPlayersCount = this.game.players.length;

    if (existingPlayersCount < playersNumber) {
      let numberToGenerate = playersNumber - existingPlayersCount;
      for(let i = 0; i < numberToGenerate; i++) {
        let name = this.getDefaultName(existingPlayersCount + (i + 1));
        this.game.addPlayer({name});
      }
    }
    else {
      this.game.players = this.game.players.slice(0, playersNumber);
    }

  }

  private getDefaultName(index) {
    return this.translateService.instant('players.default_name', {index})
  }
}
