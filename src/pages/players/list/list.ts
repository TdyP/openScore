import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from "ng2-translate/ng2-translate";

import { PlayerService } from '../../../providers/player/player.service';
import { PlayerModel } from '../../../providers/player/player.model';
import { PlayersView } from '../view/view';

@Component({
  templateUrl: 'list.html'
})
export class PlayersList {
  players: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public translateService: TranslateService,
    public playerService: PlayerService
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
    this.navCtrl.push(PlayersView, {player});
  }

  public showActions(player: PlayerModel) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.translateService.instant('edit') + ' ' + player.name,
          icon: 'create',
          handler: () => {
            actionSheet.dismiss()
            .then(() => {
              this.editPlayer(player);
            });

            return false;
          }
        },
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

  public editPlayer(player: PlayerModel) {
    this.alertCtrl.create({
      title: this.translateService.instant('edit') + ' ' + player.name,
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: player.name
        },
      ],
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: 'OK',
          handler: (data) => {
            //TODO: validate name is not empty
            player.name = data.name;
            this.playerService.save(player);
          }
        }
      ]
    })
    .present();
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
