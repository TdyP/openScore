import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, App, Events, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { GameHistory } from '../history/history';
import { GameChart } from '../chart/chart';
import { GameNotes } from '../notes/notes';
import { GameSettings } from '../../settings/settings';
import { GamePlayers } from '../../players/players';
import { GameService } from '../../../../providers/game/game.service';
import { GameModel } from '../../../../providers/game/game.model';
import { ErrorService } from '../../../../providers/error.service';

@Component({
  templateUrl: 'menu.html'
})
export class LiveMenu {

  links: Array<any>;
  settingsLinks: Array<any>;

  constructor(
    private translateService: TranslateService,
    private params: NavParams,
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private loadingCtrl: LoadingController,
    private events: Events,
    private app: App,
    private gameService: GameService,
    private errorServ: ErrorService
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
      },
      {
        title: this.translateService.instant('live.notes'),
        icon: 'create',
        page: GameNotes
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
    else {
      this.links.push(
        {
          title: this.translateService.instant('live.new_game'),
          icon: 'repeat',
          action: () => {
            if(confirm(this.translateService.instant('live.new_game_confirm'))) {
              this.startNewGame(game);
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
    this.viewCtrl.dismiss()
    .then(() => {
      if(menuElem.page) {
        this.app.getRootNav().push(menuElem.page, {game: this.params.get('game'), fromGameMenu: true});
      }
      else if(menuElem.action) {
        menuElem.action();
      }
    });
  }

  public startNewGame(game: GameModel) {
    this.events.publish(`game:${game.id}:new_game`, {game});
  }
}
