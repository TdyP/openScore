import { Component } from '@angular/core';
import { NavController, NavParams, AlertController  } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

import { ErrorService } from '../../../providers/error.service';
import { GameService } from '../../../providers/game/game.service';
import { PlayerService } from '../../../providers/player/player.service';
import { PlayerModel } from '../../../providers/player/player.model';
import { SortByScorePipe } from '../../../pipes/sortByScore.pipe';

@Component({
  templateUrl: 'view.html'
})
export class PlayersView {
  player: PlayerModel;
  ready: boolean = false; // To tell the view that data are loaded

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private errorServ: ErrorService,
    private gameService: GameService,
    private playerService: PlayerService,
    private sortPipe: SortByScorePipe
  ) {
    this.player = this.navParams.get('player');

    this.loadPlayerStats()
      .then(() => {
        this.ready = true;
      })
      .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')))
      .then(() => { // Always executed
        let loading = this.navParams.get('loading');
        if(loading) {
          loading.dismiss();
        }
      });
  }

  /**
   * Compute players stats
   *
   * @return {Promise<any>}
   */
  public loadPlayerStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      let stats = {
        games_played: 0,
        games_ended: 0,
        wins: 0,
        win_rate: 0,
        fav_game: '',
        fav_game_count: 0,
        playing_time: ''
      }

      let winsPerGame = {};
      let playingTimeSeconds = 0;

      this.gameService.getGamesByPlayer(this.player)
      .then(games => {
        stats.games_played = games.length;

        return Promise.all(games.map(game => {
          // For each game, we load all players and rounds to get the ranking and count wins
          return new Promise((resolve, reject) => {
            this.gameService.loadGameDetails(game) // Load players and rounds
            .then(game => {

              // Game ended: compute win stats
              if(game.isEnded()) {
                stats.games_ended++;
                this.gameService.updateRanking(game); // Add "rank" field on players

                // Get players sorted by rank
                let ranking = this.sortPipe.transform(game.players, game.score_input, true);

                // Player has won this game. Count victories per game to find out "favorite game" (game with most wins)
                if(ranking[0].id === this.player.id) {
                  stats.wins++;

                  if(typeof winsPerGame[game.name] === 'undefined') {
                    winsPerGame[game.name] = 0;
                  }

                  winsPerGame[game.name]++;
                }
              }

              // To get game duration, we take the difference between game creation and last round creation
              if(game.rounds.length) {
                playingTimeSeconds += (game.rounds.slice(-1)[0].created_at - game.createdAt.getTime()) / 1000; // Game duration in seconds
              }

              resolve();
            })
            .catch(reject);
          })
        }));
      })
      .then(games => {
        // Win rate
        stats.win_rate = stats.games_ended ? Math.round((stats.wins / stats.games_ended) * 100) : 0;

        // Favorite game with number of wins on this game
        for(let key of Object.keys(winsPerGame)) {
          if(winsPerGame[key] > stats.fav_game_count) {
            stats.fav_game_count = winsPerGame[key];
            stats.fav_game = key;
          }
        }

        // Convert seconds to readable string
        let hours = Math.floor(playingTimeSeconds / 3600);
        playingTimeSeconds %= 3600;
        let minutes = Math.floor(playingTimeSeconds / 60);
        let seconds = Math.floor(playingTimeSeconds % 60);
        stats.playing_time = `${hours}h${minutes}m${seconds}s`;

        this.player.stats = stats;
        resolve();
      })
      .catch(reject);
    });
  }

  public editPlayer() {
    this.alertCtrl.create({
      title: this.translateService.instant('edit') + ' ' + this.player.name,
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.player.name
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
            this.player.name = data.name;
            this.playerService.save(this.player);
          }
        }
      ]
    })
    .present();
  }

  public deletePlayer() {
    this.alertCtrl.create({
      title: this.translateService.instant('players.remove_confirm_title'),
      buttons: [
        {
          text: this.translateService.instant('cancel')
        },
        {
          text: 'OK',
          handler: () => {
            this.playerService.deletePlayer(this.player)
            .then(() => {
              this.navCtrl.pop();
            })
            .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.default')));
          }
        }
      ]
    })
    .present();
  }
}
