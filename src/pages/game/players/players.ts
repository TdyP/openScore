import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, PopoverController, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { ErrorService } from '../../../providers/error.service';
import { GameModel } from '../../../providers/game/game.model';
import { GameService } from '../../../providers/game/game.service';
import { PlayerService } from '../../../providers/player/player.service';

import { GameLive } from '../live/live';
import { ColorPickerPopover } from './colorPickerPopover/colorPickerPopover';

@Component({
  selector: 'page-game-players',
  templateUrl: 'players.html'
})
export class GamePlayers {

  game: GameModel;
  origGame: GameModel;
  fromGameMenu: boolean;
  allPlayers: any; // List of all players to select an existing player
  selectedPlayers: any; // To handle existing player selection

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private loadingCtrl: LoadingController,
    private translateService: TranslateService,
    private playerService: PlayerService,
    private gameService: GameService,
    private errorServ: ErrorService
  ){
    // Duplicate the game to be able to cancel modifications if user hit back button
    this.origGame = this.navParams.get('game');
    this.game = _.cloneDeep(this.navParams.get('game'));


    // Did user click on "players" on the menu or is he coming from "settings" page?
    this.fromGameMenu = this.navParams.get('fromGameMenu');

    this.selectedPlayers = [];
  }

  ionViewWillEnter() {
    if (!this.game.players.length) {
      this.defineNumber();
    }

    this.game.players.forEach(player => {
      if(!player.custom_name) {
        player.name = '';
      }
    });

    this.playerService.getAllPlayers()
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
      this.game.players[index].custom_name = selection.custom_name;
    }
    else {
      delete this.game.players[index].id;
      this.game.players[index].name = this.getDefaultName(index + 1);
    }
  }

  public setPlayerSelectable(player) {
    player.custom_name = true;
  }

  public removePlayer(player, index) {
    let self = this;
    let doRemove = function() {
      self.gameService.removePlayer(self.game, player)
        .then(() => {
          self.updatePlayersColors()
        });
    }

    if(this.game.id && player.id) {
      this.alertCtrl.create({
        title: this.translateService.instant('players.remove_confirm_title', {name: player.name ? player.name : this.getDefaultName(index + 1)}),
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
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
    }
    else { // Existing game => update players and go back to live view
      this.gameService.saveGamePlayers(this.game)
      .then(() => {
        loading.dismiss();

        if(this.fromGameMenu) {
          // On this case, we just pop this page from the nav so we need to manually update live page data
          this.origGame.players = this.game.players;
          return this.navCtrl.pop();
        }
        else {
          return this.navCtrl.push(GameLive, {game: this.game, loading});
        }
      })
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
    }
  }

  public generatePlayers(playersNumber: number) {
    let existingPlayersCount = this.game.players.length;

    if (existingPlayersCount < playersNumber) {
      let numberToGenerate = playersNumber - existingPlayersCount;
      for(let i = 0; i < numberToGenerate; i++) {
        this.game.addPlayer({name}, playersNumber);
      }
    }
    else {
      this.game.players = this.game.players.slice(0, playersNumber);
    }

  }

  public getDefaultName(index) {
    return this.playerService.getDefaultName(index);
  }

  public openColorPickerPopover(ev, player) {
    let popover = this.popoverCtrl.create(ColorPickerPopover,
      {
        player
      },
      {
        showBackdrop: true,
        enableBackdropDismiss: true,
        cssClass: 'backdropOpacityPopover color-picker-popover-wrapper'
      }
    );

    popover.present({ev});
  }

  private updatePlayersColors() {
    this.game.players.forEach((player, index) => {
      player.color = player.getRandomColor(index);
    });
  }
}
