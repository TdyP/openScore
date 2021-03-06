import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

import { PlayerService } from '../../../providers/player/player.service';
import { PlayerModel } from '../../../providers/player/player.model';
import { PlayersView } from '../view/view';

@Component({
  templateUrl: 'list.html'
})
export class PlayersList {
  players: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private translateService: TranslateService,
    private playerService: PlayerService
  ) {}

  /**
   * Loads data each time home page is displayed to keep it up to date
   */
  ionViewWillEnter() {
    this.playerService.getAllPlayers()
      .then((players) => {
        this.players = players;
      })
      .catch(console.log);
  }


  /**
   * Open player details page
   * Not used at the moment, need more interesting informations to display, like stats
   *
   * @param {PlayerModel} player
   */
  public viewPlayer(player: PlayerModel) {
    var loading = this.loadingCtrl.create({
      content: this.translateService.instant('loading')
    });
    loading.present();

    this.navCtrl.push(PlayersView, {player, loading});
  }
}
