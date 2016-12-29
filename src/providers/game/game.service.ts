import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Events } from 'ionic-angular';

import { DbService } from '../db.service';
import { PlayerService } from '../player/player.service';
import { PlayerModel } from '../player/player.model';
import { GameModel } from './game.model';

@Injectable()
export class GameService {

  constructor(
    private db: DbService,
    private playerService: PlayerService,
    private translateService: TranslateService,
    private events: Events
  ) {}

  /**
   * Get all games
   *
   * @return Promise<array>
   */
  public getAllGames() {
    return new Promise((resolve, reject) => {
      this.db.query(`
          SELECT
            g.name,
            g.id,
            g.start_date,
            g.modif_date,
            g.goal,
            g.goal_type,
            g.score_input,
            g.score_type,
            g.rounds_played,
            g.favorite,
            g.ended,
            COUNT(p.player_id) AS players_count
          FROM games AS g
          LEFT JOIN participate AS p ON p.game_id = g.id
          GROUP BY g.id
          ORDER BY modif_date DESC, start_date DESC
        `, [])
        .then(res => {
          var len = res.rows.length;
          let games = [];
          for (var i = 0; i < len; i++)
          {
            games.push(new GameModel(res.rows.item(i)));
          }

          resolve(games);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  public getGame(id ?: number): Promise<GameModel> {
    return new Promise((resolve, reject) => {
      if(id) {
        this.db.query('SELECT * FROM games WHERE id = ?',[id])
          .then(res => {

            if (res.rows.length) {
              resolve(new GameModel(res.rows.item(0)));
            }
            else {
              reject('UNKNOWN_GAME');
            }
          })
          .catch(reject);
        }
        else {
          resolve(new GameModel());
        }
    });
  }

  /**
   * Load game players and rounds
   *
   * @param {GameModel} game
   * @return Promise<GameModel>
   */
  public loadGameDetails(game: GameModel): Promise<GameModel> {
    return new Promise((resolve, reject) => {
      let scores = {};

      let processRounds = function(res) {
        if(res.err) {
          reject(res.err);
        }

        // Compute players score and add rounds to game
        let len = res.rows.length;
        for (let i = 0; i < len; i++) {
          let item = res.rows.item(i);
          if (scores[item.player_id] === undefined) {
            scores[item.player_id] = 0;
          }

          scores[item.player_id] += item.score;

          this.addRound(game, item, false);
        }

        // Retrieve players
        return this.db.query(`
          SELECT *
          FROM players AS pl
          JOIN participate AS p ON pl.id = p.player_id AND p.game_id = ?`,
          [game.id]
        );
      }

      let processPlayers = function(res) {
        if(res.err) {
          reject(res.err);
        }

        // Add players to game
        let len = res.rows.length;
        for (let i = 0; i < len; i++) {
          let player = new PlayerModel(res.rows.item(i));
          player.score = scores[player.id] || 0;
          game.players.push(player);
        }

        resolve(game);
      }

      // Retrive played rounds
      this.getGame(game.id)
      .then(detailedGame => {
        game = detailedGame;
        return this.db.query(`
          SELECT *
          FROM rounds AS r
          WHERE game_id = ?`,
          [game.id]);
      })
      .then(processRounds.bind(this), reject)
      .then(processPlayers.bind(this), reject)
      .catch(reject);
    });
  }

  public deleteGame(game: GameModel) {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM games WHERE id = ?', [game.id])
        .then(() => this.db.query('DELETE FROM participate WHERE game_id = ?', [game.id]))
        .then(() => this.db.query('DELETE FROM rounds WHERE game_id = ?', [game.id]))
        .then(resolve)
        .catch(reject);
    })
  }

  /**
   * Save game
   * @param {GameModel} game     Game to save
   */
  public saveGamePlayers(game: GameModel): Promise<GameModel> {

    return new Promise((resolve, reject) => {
      this.clearParticipations(game)
        .then(() => {
          return Promise.all(game.players.map((playerToSave, index) => {
            if(!playerToSave.name) {
              playerToSave.name = this.playerService.getDefaultName(index + 1);
              playerToSave.custom_name = false;
            }
            else {
              playerToSave.custom_name = true;
            }

            return this.playerService.save(playerToSave)
              .then(savedPlayer => this.saveParticipation(game, savedPlayer));
          }))
        })
        .then(() => resolve(game))
        .catch(reject);
      });

  }

  public clearParticipations(game: GameModel): Promise<any> {
    return this.db.query('DELETE FROM participate WHERE game_id = ?', [game.id]);
  }

  public saveParticipation(game: GameModel, player: PlayerModel): Promise<PlayerModel> {
    return new Promise((resolve, reject) => {
      this.db.query(`INSERT INTO participate (game_id, player_id) VALUES(?, ?)`, [game.id, player.id])
        .then(() => resolve(player))
        .catch(reject);
    });
  }

  public saveGame(game: GameModel) {
    return new Promise((resolve, reject) => {
      let query;
      let params = [
        game.name,
        game.start_date,
        Date.now(),
        game.score_type,
        game.score_input,
        game.goal,
        game.goal_type,
        game.favorite ? 1 : 0,
        game.rounds_played
      ];

      if(game.id) {
        query = 'UPDATE games set name = ?, start_date = ?, modif_date = ?, score_type = ?, score_input = ?, goal = ?, goal_type = ?, favorite = ?, rounds_played = ? WHERE id = ?';
        params.push(game.id);
      }
      else {
        query = 'INSERT INTO games (name, start_date, modif_date, score_type, score_input, goal, goal_type, favorite, rounds_played) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
      }

      this.db.query(query, params)
        .then(res => {
          if(!game.id) {
            game.id = res.insertId;
          }

          this.updateRanking(game);

          resolve(game);
        }, reject);
    });
  }

  public updateScore(game: GameModel, player: PlayerModel, score: number): Promise<any> {
    score = Number(score);
    player.score += score;
    this.updateRanking(game);
    player.tmpScore = 0;
    return this.addRound(game, { player_id: player.id, score });
  }

  public updateRanking(game: GameModel) {
    let players = game.players.slice(0);

    players.sort(this.sortPlayersByScore(game));

    for(let i = 0; i < players.length; i++) {
      players[i].rank = i + 1;
    }
  }

  public sortPlayersByScore(game: GameModel) {
    return function(a, b) {
      if(game.score_type === 'asc') {
        return b.score - a.score;
      }
      else {
        return a.score - b.score;
      }
    }
  }

  public addRound(game: GameModel, round_data: any, save:boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      let prom;

      // Save round to DB if required
      if (save) {
        prom = this.db.query(`INSERT INTO rounds (game_id, player_id, score, created_at) VALUES (?, ?, ?, ?)`,
          [game.id, round_data.player_id, round_data.score, Date.now()])
          .then(res => {
            round_data.id = res.insertId;
            return this.saveGame(game);
          })
      }
      else {
        prom = Promise.resolve();
      }

      // Update game object
      prom.then(() => {
        game.rounds.push(round_data);
        this.updateRoundsPlayed(game);
      });

      // Save game object to DB if required
      if(save) {
        prom.then(() => this.saveGame(game));
      }

      // Resolve
      prom.then(resolve)
        .catch(reject);
    })
  }

  public updateRound(round: any) {
    return this.db.query('UPDATE rounds SET score = ? WHERE id = ?', [round.score, round.id]);
  }

  public removeRound(game: GameModel, round: any, player: PlayerModel) {
    // Update player score
    player.score -= round.score;

    // Remove round
    let index = game.rounds.indexOf(round);
    game.rounds.splice(index, 1);

    this.updateRoundsPlayed(game);

    // Delete from database
    return this.db.query('DELETE FROM rounds where id = ?', [round.id]);
  }

  public getPreviousGamesSettings() {
    return new Promise((resolve, reject) => {
      this.db.query(`
        SELECT DISTINCT
          start_date,
          modif_date,
          name,
          score_type,
          score_input,
          goal,
          goal_type,
          rounds_limit,
          rounds_played
        FROM games
        WHERE name IS NOT NULL
        ORDER BY modif_date DESC, start_date DESC;
      `, [])
      .then(res => {
        let len = res.rows.length;
        let games = [];
        for (let i = 0; i < len; i++)
        {
          games.push(new GameModel(res.rows.item(i)));
        }

        resolve(games);
      }, reject)
      .catch(reject);
    });
  }

  public removePlayer(game: GameModel, player: PlayerModel): Promise<any> {
    let index = game.players.indexOf(player);
    game.players.splice(index, 1);

    // Clear rounds played by this player
    let len = game.rounds.length;
    let removedRounds = [];
    for(let i = 0; i < len; i++) {
      if(game.rounds[i].player_id === player.id) {
        removedRounds.push(game.rounds[i].id);
        delete game.rounds[i];
      }
    }

    // Clean up rounds and participation in DB
    return this.db.query('DELETE FROM participate WHERE game_id = ? AND player_id = ?', [game.id, player.id])
      .then(() => {
        if(removedRounds.length) {
          return this.db.query('DELETE FROM rounds WHERE game_id = ? AND player_id = ?', [game.id, player.id]);
        }
        else {
          return Promise.resolve();
        }
      });
  }

  public updateRoundsPlayed(game: GameModel): void {
    let playersRounds = {};
    let roundsPlayed = 0;
    for(let round of game.rounds) {
      if(playersRounds[round.player_id] === undefined) {
        playersRounds[round.player_id] = 0;
      }

      playersRounds[round.player_id]++;

      roundsPlayed = Math.max(roundsPlayed, playersRounds[round.player_id]);
    }

    game.rounds_played = roundsPlayed;
  }

/**
 * Set game as ended, save it to DB and publish an event to tell the app the game is over
 * @param  {GameModel}    game
 * @return {Promise<any>}      Resolved when game is saved and event published
 */
  public endGame(game: GameModel): Promise<any> {
    return new Promise((resolve, reject) => {
      game.endGame();

      this.db.query('UPDATE games SET ended = ? WHERE id = ?', [game.ended ? 1 : 0, game.id])
        .then(() => {
          this.events.publish('game:ended', game);
          resolve();
        })
        .catch(reject);
    });
  }
}
