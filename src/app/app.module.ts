import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from "@angular/http";
import { IonicApp, IonicModule } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { OpenScore } from './app.component';
import { ChartsModule } from "ng2-charts";

/** Providers */
import { DbService } from '../providers/db.service';
import { LocaleService } from '../providers/locale.service';
import { GameService } from '../providers/game/game.service';
import { PlayerService } from '../providers/player/player.service';
import { ErrorService } from '../providers/error.service';

/** Components */
import { HomePage } from '../pages/home/home';
import { HomeMenu } from '../pages/home/menu/menu';
import { AboutPage } from '../pages/about/about';
import { GameSettings } from '../pages/game/settings/settings';
import { GamePlayers } from '../pages/game/players/players';
import { GameLive } from '../pages/game/live/live';
import { LiveMenu } from '../pages/game/live/menu/menu';
import { NewRoundModal } from '../pages/game/live/newRound/newRound';
import { GameOverModal } from '../pages/game/live/gameOver/gameOver';
import { GameChart } from '../pages/game/live/chart/chart';
import { GameHistory } from '../pages/game/live/history/history';
import { PlayersList } from '../pages/players/list/list';
import { PlayersView } from '../pages/players/view/view';
import { SortGamesPipe } from '../pipes/sortGames.pipe';
import { AvailablePlayersPipe } from '../pipes/availablePlayers.pipe';
import { SortByScorePipe } from '../pipes/sortByScore.pipe';

export function translateLoaderFactory(http: any) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function localeServiceFactory(localeService: any) {
  return localeService.getLocale();
}

@NgModule({
  declarations: [
    OpenScore,
    HomePage,
    HomeMenu,
    AboutPage,
    GameSettings,
    GamePlayers,
    GameLive,
    LiveMenu,
    NewRoundModal,
    GameOverModal,
    GameChart,
    GameHistory,
    PlayersList,
    PlayersView,
    SortGamesPipe,
    AvailablePlayersPipe,
    SortByScorePipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ChartsModule,
    IonicModule.forRoot(OpenScore),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [Http]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    OpenScore,
    HomePage,
    HomeMenu,
    AboutPage,
    GameSettings,
    GamePlayers,
    GameLive,
    LiveMenu,
    NewRoundModal,
    GameOverModal,
    GameChart,
    GameHistory,
    PlayersList,
    PlayersView
  ],
  providers: [
    SQLite,
    StatusBar,
    TranslateService,
    DbService,
    LocaleService,
    ErrorService,
    GameService,
    PlayerService,
    SortByScorePipe,
    { // Set user locale for Date pipes
      provide: LOCALE_ID,
      deps: [LocaleService],
      useFactory: localeServiceFactory
    }
  ]
})
export class AppModule {}
