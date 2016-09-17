/**
 * External dependencies
 */
import {Component, provide, PLATFORM_PIPES} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {Http, HTTP_PROVIDERS} from '@angular/http';
import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import { ColorPickerService } from 'angular2-color-picker';
import '../node_modules/chart.js/dist/Chart.bundle.min.js';

/**
 * Internal dependencies
 */
import {HomePage} from './home/home';
import {DbService} from './db.service';
import {GameService} from './game/game.service';
import {PlayersService} from './game/players/players.service';

@Component({
  template: '<ion-nav [root]="rootPage" #content><ion-overlay></ion-overlay></ion-nav>',
  providers: [
    DbService,
    provide(TranslateLoader, {
      useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
      deps: [Http]
    }),
    TranslateService
  ],
  pipes: [TranslatePipe]
})
export class OpenScore {
  rootPage: any = HomePage;
  translate: TranslateService;

  constructor(platform: Platform, dbService: DbService, translate: TranslateService) {
    this.translate = translate;
    this.initializeTranslateServiceConfig();

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      return dbService.init();
    })
    .catch(console.log);
  }

  private initializeTranslateServiceConfig() {
    var userLang = navigator.language.split('-')[0];
    userLang = /(en|fr)/gi.test(userLang) ? userLang : 'en';

    this.translate.setDefaultLang('en');
    this.translate.use(userLang);
  }
}

ionicBootstrap(OpenScore, [
  {provide: PLATFORM_PIPES, useValue: TranslatePipe, multi: true},
  DbService,
  GameService,
  PlayersService,
  TranslateService,
  ColorPickerService,
  TranslateLoader
]);
