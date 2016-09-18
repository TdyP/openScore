import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from "ng2-translate/ng2-translate";

import { GameModel } from '../../game.model';
import { GameService } from '../../game.service';
import { PlayerModel } from '../../players/players.model';

@Component({
  templateUrl: 'build/game/live/history/history.html'
})
export class GameHistory {

  game: GameModel;
  player: any;
  rounds: Array<any>;
  sortedRounds: any;
  playerIds: Array<any>;
  roundsNumber: Array<number>;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private translateService: TranslateService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private gameService: GameService
  ) {
    this.game = this.navParams.get('game');
    this.player = this.navParams.get('player');


    // Add player object to each round
    this.rounds = this.game.rounds.filter(round => {
      return this.player === undefined || round.player_id === this.player.id;
    })
    .map(round => {
      round.player = this.game.getPlayerById(round.player_id);
      console.log('player found', round.player);
      return round;
    });

    // Init history table data
    this.sortRounds();

    console.log('SROTED ROUNDS', this.game, this.sortedRounds);
  }

  /**
   * Stash rounds into an object grouped by players
   */
  private sortRounds() {
    this.sortedRounds = {};
    for(let round of this.rounds) {
      if(this.sortedRounds[round.player_id] === undefined) {
        this.sortedRounds[round.player_id] = {
          player: this.game.getPlayerById(round.player_id),
          rounds: []
        }
      }

      this.sortedRounds[round.player_id].rounds.push(round);
    }

    this.playerIds = Object.keys(this.sortedRounds);
    this.roundsNumber = [];
    for(let i = 0; i < this.game.rounds_played; i++) {
      this.roundsNumber.push(i + 1);
    }
  }

  /**
   * Display actions sheet when pressing a score
   * @param {any} round
   */
  public showActions(round: any) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.translateService.instant('edit'),
          icon: 'create',
          handler: () => {
            actionSheet.dismiss()
            .then(() => {
              this.editRound(round);
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
              this.deleteRound(round);
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
  public deleteRound(round: any) {
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
            this.gameService.removeRound(this.game, round)
            .then(() => this.sortRounds()) // Refresh history table data
            .catch(console.error);
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
  public editRound(round: any) {
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
            round.player.score += (-oldScore + round.score);
            this.gameService.updateRound(round);
          }
        }
      ]
    })
    .present();
  }
}
