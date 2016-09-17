import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, App } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { PlayersList } from '../../players/list/list';

@Component({
  templateUrl: 'build/shared/menu.html'
})
export class HomeMenu {

  links: Array<any>;

  constructor(
    private translateService: TranslateService,
    private params: NavParams,
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private app: App
  ) {
    this.translateService = translateService;

    this.links = [
      {
        title: this.translateService.instant('home.players'),
        icon: 'people',
        page: PlayersList
      }
    ];
  }

  public openPage(page) {
    this.viewCtrl.dismiss()
      .then(() => {
        this.app.getRootNav().push(page);
      });
  }
}
