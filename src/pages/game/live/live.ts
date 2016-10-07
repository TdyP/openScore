import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, PopoverController, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { GameModel } from '../../../providers/game/game.model';
import { GameService } from '../../../providers/game/game.service';
import { PlayerModel } from '../../../providers/player/player.model';

import { LiveMenu } from './menu/menu';
import { GameHistory } from './history/history';
import { NewRoundModal } from './newRound/newRound';

@Component({
  templateUrl: 'live.html'
})
export class GameLive {

  game: GameModel;
  pendingScore: any;
  tmpScoreDelay: number = 7000;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translateService: TranslateService,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public gameService: GameService
  ) {
    this.game = this.navParams.get('game');
    this.pendingScore = {};
    this.gameService.updateRanking(this.game);
  }

  public updateTmpScore(player: PlayerModel, score: number) {
    // Delay actual score saving allowing to tap multiple time before saving

    clearTimeout(this.pendingScore[player.id]); // Reset timeout on each tap

    this.pendingScore[player.id] = setTimeout((() => {
      this.updateScore(player, player.tmpScore);
    }).bind(this), this.tmpScoreDelay);

    player.tmpScore += Number(score);

    // Temp score is 0, no point to save it
    if(!player.tmpScore) {
      clearTimeout(this.pendingScore[player.id]);
      delete this.pendingScore[player.id];
    }
  }

  public updateScore(player: PlayerModel, score: number) {
    this.gameService.updateScore(this.game, player, score);

    delete this.pendingScore[player.id];
  }

  public openScoreModal(player, minus : boolean = false) {
    let title = minus ? 'live.substract' : 'live.add';
    let tmpScore = player.tmpScore;
    player.tmpScore = 0;

    let alert = this.alertCtrl.create({
      title: this.translateService.instant(title),
      inputs: [
        {
          name: 'score',
          placeholder: this.translateService.instant('live.score'),
          type: 'number',
          value: tmpScore || ''
        },
      ],
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: this.translateService.instant('ok'),
          handler: data => {
            let score = data.score;

            if (score !== '') {
              if (minus) {
                score = -score;
              }
              this.updateScore(player, score);
            }
          }
        }
      ]
    });
    alert.present();
  }

  public showMenu(ev) {
    let popover = this.popoverCtrl.create(LiveMenu, {game: this.game});
    popover.present({ev});
  }

  public newRound() {
    this.modalCtrl.create(NewRoundModal,
      {
        game: this.game
      },
      {
        showBackdrop: true,
        enableBackdropDismiss: true
      }
    )
    .present();
  }

  public openPlayerHistory(player: PlayerModel) {
    this.navCtrl.push(GameHistory, {game: this.game, player});
  }
}