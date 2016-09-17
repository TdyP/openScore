import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from "ng2-translate/ng2-translate";
import { PlayersService } from '../../game/players/players.service';
import { PlayerModel } from '../../game/players/players.model';
import { PlayersView } from '../view/view';

@Component({
  templateUrl: 'build/players/list/list.html'
})
export class PlayersList {
  players: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private translateService: TranslateService,
    private playerService: PlayersService
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


  public viewPlayer(player) {
    this.navCtrl.push(PlayersView, {player});
  }

  public showActions(player: PlayerModel) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.translateService.instant('delete') + ' ' + player.name,
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            actionSheet.dismiss()
            .then(() => {
              this.deletePlayer(player);
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

  public deletePlayer(player: PlayerModel) {
    this.alertCtrl.create({
      title: this.translateService.instant('players.remove_confirm_title'),
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: 'OK',
          handler: () => {
            this.playerService.deletePlayer(player);
            let index = this.players.indexOf(player);
            this.players.splice(index, 1);
          }
        }
      ]
    })
    .present();
  }
}
