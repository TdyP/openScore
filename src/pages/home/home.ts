import { Component } from '@angular/core';
import { TranslateService } from "ng2-translate/ng2-translate";
import { NavController, AlertController, ActionSheetController, PopoverController, ToastController, LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ErrorService } from '../../providers/error.service';
import { GameService } from '../../providers/game/game.service';
import { GameModel } from '../../providers/game/game.model';
import { GameSettings } from '../game/settings/settings';
import { GameLive } from '../game/live/live';
import { HomeMenu } from './menu/menu';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  games: any;

  constructor(
    private navCtrl: NavController,
    private translateService: TranslateService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private gameService: GameService,
    private events: Events,
    private errorServ: ErrorService
  ) {}

  ionViewWillEnter() {
    var loading = this.loadingCtrl.create({
      content: this.translateService.instant('loading')
    });
    loading.present();
    this.gameService.getAllGames()
      .then((games) => {
        loading.dismiss();
        this.games = games;
      })
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.load_all_games')));
  }

  /**
   * Go to new game settings
   */
  public newGame() {
    this.navCtrl.push(GameSettings, {});
  }

  public openGame(game: GameModel) {
    var loading = this.loadingCtrl.create({
      content: this.translateService.instant('loading')
    });
    loading.present();

    this.gameService.loadGameDetails(game)
      .then(game => {
        this.navCtrl.push(GameLive, {game, loading})
      })
      .catch(err => {
        loading.dismiss();
        this.errorServ.handle(err, this.translateService.instant('errors.load_game'))
      });
  }

  public showActions(game: GameModel) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.translateService.instant('delete'),
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            actionSheet.dismiss()
            .then(() => {
              this.deleteGame(game);
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

  public deleteGame(game: GameModel) {
    this.alertCtrl.create({
      title: this.translateService.instant('home.remove_confirm_title'),
      message: '',
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: 'OK',
          handler: () => {
            this.gameService.deleteGame(game)
              .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.delete_game')));
            let index = this.games.indexOf(game);
            this.games.splice(index, 1);
          }
        }
      ]
    })
    .present();
  }

  public toggleFavorite(game: GameModel) {
    game.favorite = !game.favorite;
    this.gameService.saveGame(game)
      .catch(err => {
        game.favorite = !game.favorite;
        this.errorServ.handle(err, this.translateService.instant('errors.default'))
      });
  }

  public showMenu(ev) {
    let popover = this.popoverCtrl.create(HomeMenu, {}, {cssClass:"home-menu"});
    popover.present({ev});
  }
}
