import { NgModule, LOCALE_ID } from '@angular/core';
import { Http } from "@angular/http";
import { IonicApp, IonicModule } from 'ionic-angular';
import { SQLite } from 'ionic-native';
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate/ng2-translate';
import { OpenScore } from './app.component';
import { ChartsModule } from "ng2-charts/components/charts/charts";

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
import { GameChart } from '../pages/game/live/chart/chart';
import { GameHistory } from '../pages/game/live/history/history';
import { PlayersList } from '../pages/players/list/list';
import { PlayersView } from '../pages/players/view/view';
import { SortGamesPipe } from '../pipes/sortGames.pipe';
import { AvailablePlayersPipe } from '../pipes/availablePlayers.pipe';
import { SortByScorePipe } from '../pipes/sortByScore.pipe';

export function translateLoaderFactory(http: any) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
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
    GameChart,
    GameHistory,
    PlayersList,
    PlayersView,
    SortGamesPipe,
    AvailablePlayersPipe,
    SortByScorePipe
  ],
  imports: [
    ChartsModule,
    IonicModule.forRoot(OpenScore),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateLoaderFactory,
      deps: [Http]
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
    GameChart,
    GameHistory,
    PlayersList,
    PlayersView
  ],
  providers: [
    SQLite,
    DbService,
    LocaleService,
    ErrorService,
    GameService,
    PlayerService,
    { // Set user locale for Date pipes
      provide: LOCALE_ID,
      deps: [LocaleService],
      useFactory: (localeService) => localeService.getLocale()
    }
  ]
})
export class AppModule {}
