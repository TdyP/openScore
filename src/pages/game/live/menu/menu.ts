import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, App } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { GameHistory } from '../history/history';
import { GameChart } from '../chart/chart';
import { GameSettings } from '../../settings/settings';
import { GamePlayers } from '../../players/players';

@Component({
  templateUrl: 'menu.html'
})
export class LiveMenu {

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
        title: this.translateService.instant('live.history'),
        icon: 'list',
        page: GameHistory
      },
      {
        title: this.translateService.instant('live.chart'),
        icon: 'trending-up',
        page: GameChart
      },
      {
        title: this.translateService.instant('live.settings'),
        icon: 'settings',
        page: GameSettings
      },
      {
        title: this.translateService.instant('live.players'),
        icon: 'people',
        page: GamePlayers
      }
    ];
  }

  public openPage(page) {
    this.viewCtrl.dismiss();
    this.app.getRootNav().push(page, {game: this.params.get('game'), fromGameMenu: true});
  }
}
