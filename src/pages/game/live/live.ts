import { Component, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, NavParams, AlertController, PopoverController, ModalController, Platform, Events } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { ErrorService } from '../../../providers/error.service';
import { GameModel } from '../../../providers/game/game.model';
import { GameService } from '../../../providers/game/game.service';
import { PlayerModel } from '../../../providers/player/player.model';

import { LiveMenu } from './menu/menu';
import { GameHistory } from './history/history';
import { NewRoundModal } from './newRound/newRound';
import { GameOverModal } from './gameOver/gameOver';

@Component({
  selector: 'page-game-live',
  templateUrl: 'live.html'
})
export class GameLive {

  game: GameModel;
  pendingScore: any;
  tmpScoreDelay: number = 5000;
  playerBlockHeight: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private translateService: TranslateService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private events: Events,
    private gameService: GameService,
    private errorServ: ErrorService,
    private platform: Platform,
    private zone: NgZone,
    private sanitizer: DomSanitizer
  ) {
    this.game = this.navParams.get('game');
    this.pendingScore = {};
    this.gameService.updateRanking(this.game);

    let loading = this.navParams.get('loading');
    if(loading) {
      loading.dismiss();
    }

    events.subscribe(`game:${this.game.id}:ended`, () => this.handleGameEnded());
    events.subscribe(`game:${this.game.id}:score_updated`, () => this.checkGameEnd());
  }

  public ngOnInit() {
    // Watch for orientation change to update player block height
    window.addEventListener("resize", function() {
      this.zone.run(() => {
        this.setPlayerBlockHeight();
      })
    }.bind(this), false);
  }

  public ionViewWillEnter() {
    this.setPlayerBlockHeight(); // Init height when view rendering is over
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
    this.gameService.updateScore(this.game, player, score)
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));

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

  /**
   * Update player block height.
   * To get the height, we check available height (window - header height - footer height)
   * and divide it by the number of rows: 1 row per player in portrait, and 2 players per row in landscape
   */
  public setPlayerBlockHeight() {
    let mql = window.matchMedia("(orientation: portrait)");
    let isPortrait = mql.matches;
    let headerHeight = document.querySelector('page-game-live ion-header').clientHeight;
    let contentHeight = document.querySelector('page-game-live ion-content').clientHeight
    let footerHeight = document.querySelector('page-game-live ion-footer').clientHeight + 4; // Add arbitrary extra margin to avoid content stuck to footer
    let availableHeight = contentHeight - headerHeight - footerHeight   ;
    let rowsCount = isPortrait ? this.game.players.length : Math.round(this.game.players.length / 2);
    let elemMargin = window.getComputedStyle(document.querySelector('page-game-live .scroll-content .players .player_wrapper')).margin;

    // We need to sanitize height formula otherwise Angular won't be happy
    this.playerBlockHeight = this.sanitizer.bypassSecurityTrustStyle(`calc(${availableHeight}px / ${rowsCount} - 2*${elemMargin})`);
  }

  public handleGameEnded() {
    this.modalCtrl.create(GameOverModal,
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

  /**
   * Check if we reach the game end, based on game settings.
   * If goal type is score => check players score
   * If goal type if round => check rounds count
   */
  public checkGameEnd() {
    let gameOver = false;

    if(this.game.goal_type === 'rounds') {
      if(this.game.rounds_played >= this.game.goal) {
        gameOver = true;
      }
    }
    else if(this.game.goal_type === 'score') {
      for(let player of this.game.players) {
        if(player.score >= this.game.goal) {
          gameOver = true;
          break;
        }
      }
    }

    if(gameOver) {
      this.gameService.endGame(this.game);
    }
  }

  /**
   * Is this player the last who played?
   *
   * @param  {PlayerModel} player
   * @return {boolean}
   */
  public isLastRoundPlayer(player: PlayerModel): boolean {
    let lastRound = this.game.rounds.slice(-1)[0];

    return typeof lastRound !== 'undefined' && lastRound.player_id === player.id;
  }

}
