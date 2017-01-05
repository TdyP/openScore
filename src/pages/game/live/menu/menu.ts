import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, App } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { GameHistory } from '../history/history';
import { GameChart } from '../chart/chart';
import { GameSettings } from '../../settings/settings';
import { GamePlayers } from '../../players/players';
import { GameService } from '../../../../providers/game/game.service';

@Component({
  templateUrl: 'menu.html'
})
export class LiveMenu {

  links: Array<any>;
  settingsLinks: Array<any>;

  constructor(
    private translateService: TranslateService,
    private gameService: GameService,
    private params: NavParams,
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private app: App
  ) {
    this.translateService = translateService;
    let game = this.params.get('game');

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
      }
    ];

    if(!game.ended) {
      this.links.push(
        {
          title: this.translateService.instant('live.end_game'),
          icon: 'trophy',
          action: () => {
            if(confirm(this.translateService.instant('live.end_game_confirm'))) {
              this.gameService.endGame(game);
            }
          }
        }
      );
    }

    this.settingsLinks = [
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

  /**
   * Handle a click on a menu element:
   *   - if this is a page link => display this page
   *   - if this is an action => execute it
   * @param {any} menuElem Menu element defined in constructor above
   */
  public handleMenuClick(menuElem) {
    this.viewCtrl.dismiss();

    if(menuElem.page) {
      this.app.getRootNav().push(menuElem.page, {game: this.params.get('game'), fromGameMenu: true});
    }
    else if(menuElem.action) {
      menuElem.action();
    }
  }
}
