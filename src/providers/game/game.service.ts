import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
            g.notes,
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

  /**
   * Get game from ID or a new one if ID not provided
   *
   * @param  {number}             id
   * @return {Promise<GameModel>}
   */
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
   * Retrieve games played by given player
   *
   * @param  {PlayerModel} player
   * @return {Promise<Array<GameModel>>}
   */
  public getGamesByPlayer(player: PlayerModel): Promise<Array<GameModel>> {
    return new Promise((resolve, reject) => {
      this.db.query(
        `
          SELECT * FROM games g
          LEFT JOIN participate p on g.id = p.game_id
          WHERE p.player_id = ?
        `,
        [player.id]
      )
      .then(res => {
        var len = res.rows.length;
        let games = [];
        for (var i = 0; i < len; i++)
        {
          games.push(new GameModel(res.rows.item(i)));
        }

        resolve(games);
      })
      .catch(reject);
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

          this.addRound(game, item, false, true);
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

      // Retrieve played rounds
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

  /**
   * Delete a game from DB
   * @param {GameModel} game
   * @return {Promise<any>}
   */
  public deleteGame(game: GameModel): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM games WHERE id = ?', [game.id])
        .then(() => this.db.query('DELETE FROM participate WHERE game_id = ?', [game.id]))
        .then(() => this.db.query('DELETE FROM rounds WHERE game_id = ?', [game.id]))
        .then(resolve)
        .catch(reject);
    })
  }

  /**
   * Save game players only
   *
   * @param {GameModel} game     Game to save
   * @return {Promise<GameModel>}
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

  /**
   * Clear all participations from DB.
   * Used to clear up DB table before saving game players
   *
   * @param  {GameModel}    game
   * @return {Promise<any>}
   */
  public clearParticipations(game: GameModel): Promise<any> {
    return this.db.query('DELETE FROM participate WHERE game_id = ?', [game.id]);
  }

  /**
   * Link a player to a game in DB
   *
   * @param  {GameModel}            game
   * @param  {PlayerModel}          player
   * @return {Promise<PlayerModel>}
   */
  public saveParticipation(game: GameModel, player: PlayerModel): Promise<PlayerModel> {
    return new Promise((resolve, reject) => {
      this.db.query(`INSERT INTO participate (game_id, player_id) VALUES(?, ?)`, [game.id, player.id])
        .then(() => resolve(player))
        .catch(reject);
    });
  }

  /**
   * Save a game
   *
   * @param {GameModel} game
   * @return {Promise<GameModel>}
   */
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
        game.rounds_played,
        game.notes,
      ];

      if(game.id) {
        query = 'UPDATE games set name = ?, start_date = ?, modif_date = ?, score_type = ?, score_input = ?, goal = ?, goal_type = ?, favorite = ?, rounds_played = ?, notes = ? WHERE id = ?';
        params.push(game.id);
      }
      else {
        query = 'INSERT INTO games (name, start_date, modif_date, score_type, score_input, goal, goal_type, favorite, rounds_played, notes) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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

  /**
   * Update player score: update score in player object, update game ranking and add round to game
   * @param  {GameModel}    game
   * @param  {PlayerModel}  player
   * @param  {number}       score
   * @param  {boolean}      skipScoreUpdatePub
   * @return {Promise<any>}
   */
  public updateScore(game: GameModel, player: PlayerModel, score: number, skipScoreUpdatePub: boolean = false): Promise<any> {
    score = Number(score);
    player.score += score;
    this.updateRanking(game);
    player.tmpScore = 0;
    return this.addRound(game, { player_id: player.id, score }, true, skipScoreUpdatePub);
  }

  /**
   * Compute players ranking and add it to player data. This ranking is then used for ranking display
   *
   * @param {GameModel} game
   */
  public updateRanking(game: GameModel) {
    let players = game.players.slice(0);

    players.sort(this.sortPlayersByScore(game));

    for(let i = 0; i < players.length; i++) {
      players[i].rank = i + 1;
    }
  }

  /**
   * Used to compute ranking. Players are sorted by score.
   * If score are equals, we sort by name
   * @param {GameModel} game
   */
  public sortPlayersByScore(game: GameModel) {
    return function(a, b) {
      if(a.score === b.score) {
        return a.name.localeCompare(b.name);
      }
      else if(game.score_type === 'asc') {
        return b.score - a.score;
      }
      else {
        return a.score - b.score;
      }
    }
  }

  /**
   * Add round to game
   * the save flag is used to specify if we want to save rounds to DB. On game loading, we retrieve all rounds from DB
   * and add it to the game with this function. Thus, we don't want to save rounds in this case.
   *
   * @param  {GameModel}    game
   * @param  {any}          round_data
   * @param  {boolean}      save               Whether to save round to DB
   * @param  {boolean}      skipScoreUpdatePub
   * @return {Promise<any>}
   */
  public addRound(game: GameModel, round_data: any, save:boolean = true, skipScoreUpdatePub: boolean = false): Promise<any> {
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
      prom.then(() => {
        if(!skipScoreUpdatePub) {
          this.publishGameScoreUpdate(game);
        }

        resolve();
      })
      .catch(reject);
    })
  }

  /**
   * Update a round score
   * @param  {any}          round
   * @param  {GameModel}    game
   * @return {Promise<any>}
   */
  public updateRound(round: any, game: GameModel): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.query('UPDATE rounds SET score = ? WHERE id = ?', [round.score, round.id])
        .then(() => {
          this.publishGameScoreUpdate(game);
          resolve();
        })
        .catch(reject);
    })
  }

  /**
   * Delete round from game and save it to DB
   * @param {GameModel}   game
   * @param {any}         round
   * @param {PlayerModel} player
   */
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

  /**
   * Load previous games with settings
   *
   * @return {Promise<Array<GameModel>>} List of previous without duplicates
   */
  public getPreviousGamesSettings(): Promise<Array<GameModel>> {
    return new Promise((resolve, reject) => {
      this.db.query(`
        SELECT
          name,
          score_type,
          score_input,
          goal,
          goal_type,
          rounds_limit
        FROM games
        WHERE name IS NOT NULL
        GROUP BY name
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

  /**
   * Remove player from game
   * @param  {GameModel}    game
   * @param  {PlayerModel}  player
   * @return {Promise<any>}
   */
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

  /**
   * Update number of rounds played in game.
   * In case of 'per player' score input, each player may have played a different number
   * of rounds. In this case, we consider the maximum number.
   *
   * @param {GameModel} game
   */
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
      if(game.ended) { // If game has already been ended, don't do anything
        resolve();
      }
      else {
        game.endGame();

        this.db.query('UPDATE games SET ended = ? WHERE id = ?', [game.ended ? 1 : 0, game.id])
          .then(() => {
            this.events.publish(`game:${game.id}:ended`, game);
            resolve();
          })
          .catch(reject);
      }
    });
  }

  /**
   * Publish an event 'score updated'
   * @param {GameModel} game
   */
  public publishGameScoreUpdate(game: GameModel) {
    this.events.publish(`game:${game.id}:score_updated`, {game});
  }

  /**
   * Make a copy of the game with exact same settings and players but no rounds played.
   *
   * @param  {GameModel}          game
   * @return {Promise<GameModel>}      The newly created game
   */
  public duplicateGame(game: GameModel): Promise<GameModel> {
    return new Promise((resolve, reject) => {
      let newGame = new GameModel(game);

      // Reset game specific fields
      delete newGame.id;
      newGame.favorite = false;
      newGame.modif_date = Date.now();
      newGame.start_date = Date.now();
      newGame.ended = false;
      newGame.rounds = [];
      newGame.rounds_count = 0;
      newGame.rounds_played = 0;

      // Reset players scores and ranking
      for(let player of newGame.players) {
        player.score = 0;
        player.rank = 0;

        if(!player.custom_name) {
          player.name = '';
        }
      }

      this.saveGame(newGame)
        .then(() => this.saveGamePlayers(newGame))
        .then(() => resolve(newGame))
        .catch(reject);
    });
  }
}
