import { Component } from '@angular/core';
import { TranslateService } from "ng2-translate/ng2-translate";
import { NavController, AlertController, ActionSheetController, PopoverController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { GameService } from '../../providers/game/game.service';
import { GameModel } from '../../providers/game/game.model';
import { GameSettings } from '../game/settings/settings';
import { GameLive } from '../game/live/live';
import { HomeMenu } from './menu/menu';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {
  games: any;

  constructor(
    public navCtrl: NavController,
    public translateService: TranslateService,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public popoverCtrl: PopoverController,
    public gameService: GameService,
    public events: Events
  ) {}

  ionViewWillEnter() {
    this.gameService.getAllGames()
      .then((games) => {
        this.games = games;
      })
      .catch(console.log);
  }

  /**
   * Go to new game settings
   */
  public newGame() {
    this.navCtrl.push(GameSettings, {});
  }

  public openGame(game: GameModel) {
    this.gameService.loadGameDetails(game)
      .then(game => {
        this.navCtrl.push(GameLive, {game})
      })
      .catch(console.error);
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
            this.gameService.deleteGame(game);
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
      .catch(console.error);
  }

  public showMenu(ev) {
    let popover = this.popoverCtrl.create(HomeMenu);
    popover.present({ev});
  }
}