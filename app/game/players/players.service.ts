import { Injectable } from '@angular/core';

import { PlayerModel } from './players.model';
import { DbService } from '../../db.service';

@Injectable()
export class PlayersService {

  db: DbService;

  constructor(db: DbService) {
    this.db = db;
  }

  public deletePlayer(player: PlayerModel): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM players WHERE id = ?', [player.id])
        .then(() => this.db.query('DELETE FROM participate WHERE player_id = ?', [player.id]))
        .then(() => this.db.query('DELETE FROM rounds WHERE player_id = ?', [player.id]))
        .then(resolve)
        .catch(reject);
    })
  }

  /**
   * Save Player
   *
   * @param {PlayerModel} player [description]
   * @return {Promise<PlayerModel>}
   */
  public save(player: PlayerModel): Promise<PlayerModel> {
    return new Promise((resolve, reject) => {
      let query;
      let params = [player.name, (player.selectable ? 1 : 0), player.color];

      if(player.id) {
        query = 'UPDATE players SET name = ?, selectable = ?, color = ? WHERE id = ?';
        params.push(player.id);
      }
      else {
        query = 'INSERT INTO players (name, selectable, color) VALUES(?, ?, ?)';
      }

      this.db.query(query, params)
        .then(obj => {
          if(!player.id) {
            player.id = obj.res.insertId;
          }

          resolve(player);
        }, reject);
    });
  }

  public getAllPlayers() {
    return new Promise((resolve, reject) => {
      this.db.query(`
        SELECT
          id,
          name,
          selectable,
          color
        FROM players
        WHERE selectable = 1
        ORDER BY name ASC;
      `)
      .then(obj => {
        let res = obj.res;
        let len = res.rows.length;
        let players = [];
        for (let i = 0; i < len; i++)
        {
          players.push(new PlayerModel(res.rows.item(i)));
        }

        resolve(players);
      }, reject)
      .catch(reject);
    });
  }

  public loadPlayerStats(player): Promise<PlayerModel> {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT count(*) AS count FROM participate WHERE player_id = ? group by player_id',[player.id]) // Get number of games played
      .then(obj => {
        player.stats.games_played = obj.res.rows.item(0).count;
        resolve(player);
      })
      .catch(reject);
    })
  }
}
