import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from "ng2-translate/ng2-translate";

import { ErrorService } from '../../../../providers/error.service';
import { GameModel } from '../../../../providers/game/game.model';
import { GameService } from '../../../../providers/game/game.service';
import { PlayerModel } from '../../../../providers/player/player.model';

@Component({
  selector: 'page-game-history',
  templateUrl: 'history.html'
})
export class GameHistory {

  game: GameModel;
  player: any;
  sortedRounds: any;
  playerIds: Array<any>;
  roundsNumber: Array<number>;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private translateService: TranslateService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private gameService: GameService,
    private errorServ: ErrorService
  ) {
    this.game = this.navParams.get('game');
    this.player = this.navParams.get('player');

    // Init history table data
    this.sortRounds();
  }

  /**
   * Stash rounds into an object grouped by players
   */
  public sortRounds() {
    this.sortedRounds = {};

    // Add player object to each round
    this.playerIds = !!this.player ? [this.player.id] : this.game.players.map(player => player.id);

    // Init rounds array for each player
    for(let playerId of this.playerIds) {
      this.sortedRounds[playerId] = {
        player: this.game.getPlayerById(playerId),
        rounds: []
      };
    }

    // Retrieve players scores
    for(let round of this.game.rounds) {
      if(!!this.sortedRounds[round.player_id] && !!this.sortedRounds[round.player_id].player) {
        this.sortedRounds[round.player_id].rounds.push(round);
      }
    }

    // Compute number of rows to display
    this.roundsNumber = [];
    let roundsCount = this.playerIds.length > 1 ? this.game.rounds_played : this.sortedRounds[this.playerIds[0]].rounds.length;
    for(let i = 0; i < roundsCount; i++) {
      this.roundsNumber.push(i + 1);
    }
  }

  /**
   * Display actions sheet when pressing a score
   * @param {any} round
   */
  public showActions(round: any, player: PlayerModel) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.translateService.instant('edit'),
          icon: 'create',
          handler: () => {
            actionSheet.dismiss()
            .then(() => {
              this.editRound(round, player);
            });

            return false;
          }
        },
        {
          text: this.translateService.instant('delete'),
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            actionSheet.dismiss()
            .then(() => {
              this.deleteRound(round, player);
            });

            return false;
          }
        },
        {
          text: this.translateService.instant('cancel'),
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    actionSheet.present();
  }

  /**
   * Display a confirm alert before deleting the round
   * @param {any} round
   */
  public deleteRound(round: any, player: PlayerModel) {
    this.alertCtrl.create({
      title: this.translateService.instant('history.remove_confirm_title'),
      message: '',
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: 'OK',
          handler: () => {
            this.gameService.removeRound(this.game, round, player)
            .then(() => this.sortRounds()) // Refresh history table data
            .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
          }
        }
      ]
    })
    .present();
  }

  /**
   * Display a confirm alert before deleting the round
   * @param {any} round
   */
  public editRound(round: any, player: PlayerModel) {
    this.alertCtrl.create({
      title: this.translateService.instant('history.edit_score'),
      message: '',
      inputs: [
        {
          name: 'score',
          type: 'number',
          value: String(round.score)
        },
      ],
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: 'OK',
          handler: (data) => {
            let oldScore = round.score;
            round.score = Number(data.score);
            player.score += (-oldScore + round.score);
            this.gameService.updateRound(round)
              .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
          }
        }
      ]
    })
    .present();
  }
}
