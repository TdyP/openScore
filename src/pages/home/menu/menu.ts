import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, App } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { PlayersList } from '../../players/list/list';
import { AboutPage } from '../../about/about';

@Component({
  templateUrl: 'menu.html'
})
export class HomeMenu {

  links: Array<any>;

  constructor(
    public translateService: TranslateService,
    public params: NavParams,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public app: App
  ) {
    this.translateService = translateService;

    this.links = [
      {
        title: this.translateService.instant('home.players'),
        icon: 'people',
        page: PlayersList
      },
      {
        title: this.translateService.instant('about.about'),
        icon: 'information-circle',
        page: AboutPage
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
