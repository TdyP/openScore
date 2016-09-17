import { Component, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from "ng2-translate/ng2-translate";
import { NavController, AlertController, ActionSheetController, PopoverController } from 'ionic-angular';

import { GameSettings } from '../game/settings/settings';
import { GameService } from '../game/game.service';
import { GameLive } from '../game/live/live';
import { GameModel } from '../game/game.model';
import { HomeMenu } from './menu/menu';
import { SortGamesPipe } from './sortGames.pipe';

@Component({
  templateUrl: 'build/home/home.html',
  providers: [GameSettings],
  pipes: [SortGamesPipe]
})
export class HomePage {
  games: any;

  constructor(
    private navCtrl: NavController,
    private translateService: TranslateService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    private gameService: GameService
  ) {}

  /**
   * Loads data each time home page is displayed to keep it up to date
   */
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
